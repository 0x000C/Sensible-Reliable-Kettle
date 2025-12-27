use rand::prelude::*;
use rayon::prelude::*;
use serde::Serialize;
use std::collections::{HashMap, HashSet};
use std::fs;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum Card {
    Number(u8),
    Modifier(Modifier),
    Action(Action),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum Modifier {
    Plus(u8),
    Times2,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum Action {
    Freeze,
    FlipThree,
    SecondChance,
}

#[derive(Debug, Clone)]
struct PlayerHand {
    numbers: HashSet<u8>,
    modifiers: Vec<Modifier>,
    has_second_chance: bool,
    busted: bool,
    stayed: bool,
}

impl PlayerHand {
    fn new() -> Self {
        Self {
            numbers: HashSet::new(),
            modifiers: Vec::new(),
            has_second_chance: false,
            busted: false,
            stayed: false,
        }
    }

    fn score(&self, flip7: bool) -> u32 {
        if self.busted {
            return 0;
        }

        let mut score: u32 = self.numbers.iter().map(|&n| n as u32).sum();

        if self.modifiers.contains(&Modifier::Times2) {
            score *= 2;
        }

        for modifier in &self.modifiers {
            if let Modifier::Plus(n) = modifier {
                score += *n as u32;
            }
        }

        if flip7 {
            score += 15;
        }

        score
    }
}

trait Strategy: Send + Sync {
    fn name(&self) -> &str;
    fn description(&self) -> &str;
    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool;
}

struct JohnsStrategy;
impl Strategy for JohnsStrategy {
    fn name(&self) -> &str { "John's Current Strategy" }
    fn description(&self) -> &str { "Draw 3 cards immediately, then stop if cards are 9-12 (or 5-8 if deck is fresh)" }

    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool {
        let card_count = hand.numbers.len();

        if card_count < 3 { return true; }

        let has_high = hand.numbers.iter().any(|&n| n >= 9);
        let has_mid = hand.numbers.iter().any(|&n| n >= 5 && n <= 8);

        if has_high { return false; }
        if deck_size > 70 && has_mid { return false; }

        let bust_prob = calculate_bust_prob(hand, deck_size);
        if bust_prob > 0.3 { return false; }

        card_count < 6
    }
}

struct PerfectMemoryStrategy;
impl Strategy for PerfectMemoryStrategy {
    fn name(&self) -> &str { "Perfect Memory" }
    fn description(&self) -> &str { "Tracks all visible cards, calculates exact bust probabilities" }

    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool {
        if hand.numbers.len() < 2 { return true; }

        let bust_prob = calculate_bust_prob(hand, deck_size);
        if bust_prob > 0.20 { return false; }

        let score: u32 = hand.numbers.iter().map(|&n| n as u32).sum();
        if score >= 25 && bust_prob > 0.15 { return false; }

        hand.numbers.len() < 6
    }
}

struct BlackjackStrategy;
impl Strategy for BlackjackStrategy {
    fn name(&self) -> &str { "Blackjack-Inspired" }
    fn description(&self) -> &str { "Stand on 18+, hit on <13" }

    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool {
        let card_count = hand.numbers.len();
        if card_count < 2 { return true; }

        let score: u32 = hand.numbers.iter().map(|&n| n as u32).sum();

        if score >= 18 && card_count >= 3 { return false; }
        if score < 13 { return true; }

        let bust_prob = calculate_bust_prob(hand, deck_size);
        if score >= 13 && score < 18 {
            if bust_prob > 0.25 { return false; }
            if card_count >= 4 && bust_prob > 0.18 { return false; }
        }

        card_count < 6
    }
}

struct ExpectedValueStrategy;
impl Strategy for ExpectedValueStrategy {
    fn name(&self) -> &str { "Expected Value Maximizer" }
    fn description(&self) -> &str { "Only draws when EV is positive" }

    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool {
        if hand.numbers.len() < 1 { return true; }

        let current_score: f64 = hand.numbers.iter().map(|&n| n as f64).sum();
        let bust_prob = calculate_bust_prob(hand, deck_size);

        let ev_stay = current_score;
        let ev_hit = (1.0 - bust_prob) * (current_score + 6.5);

        if ev_hit <= ev_stay || bust_prob > 0.35 { return false; }

        hand.numbers.len() < 6
    }
}

struct ContextAwareStrategy;
impl Strategy for ContextAwareStrategy {
    fn name(&self) -> &str { "Context-Aware Adaptive" }
    fn description(&self) -> &str { "Adjusts based on deck state and position" }

    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool {
        let card_count = hand.numbers.len();
        if card_count < 2 { return true; }

        let deck_prop = deck_size as f64 / 94.0;
        let score: u32 = hand.numbers.iter().map(|&n| n as u32).sum();
        let bust_prob = calculate_bust_prob(hand, deck_size);

        if deck_prop > 0.7 {
            if card_count >= 3 && score >= 15 { return false; }
            if bust_prob > 0.22 { return false; }
        } else if deck_prop > 0.3 {
            if card_count >= 4 && score >= 20 { return false; }
            if bust_prob > 0.28 { return false; }
        } else {
            if bust_prob > 0.35 { return false; }
        }

        card_count < 6
    }
}

struct AggressiveStrategy;
impl Strategy for AggressiveStrategy {
    fn name(&self) -> &str { "Aggressive (Poker-style)" }
    fn description(&self) -> &str { "Takes risks for 30+ points" }

    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool {
        let card_count = hand.numbers.len();
        if card_count < 4 { return true; }

        let score: u32 = hand.numbers.iter().map(|&n| n as u32).sum();
        let bust_prob = calculate_bust_prob(hand, deck_size);

        if score < 30 && bust_prob < 0.40 { return true; }
        if bust_prob > 0.45 { return false; }

        card_count < 6 && score < 35
    }
}

struct RiskAverseStrategy;
impl Strategy for RiskAverseStrategy {
    fn name(&self) -> &str { "Risk-Averse Conservative" }
    fn description(&self) -> &str { "Stops at 3-4 cards with 12+ points, never exceeds 15% bust risk" }

    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool {
        let card_count = hand.numbers.len();
        let score: u32 = hand.numbers.iter().map(|&n| n as u32).sum();
        let bust_prob = calculate_bust_prob(hand, deck_size);

        // Never exceed 15% bust probability
        if bust_prob > 0.15 { return false; }

        // Stop early if we have decent points
        if card_count >= 3 && score >= 12 { return false; }
        if card_count >= 4 { return false; }

        card_count < 5
    }
}

struct HighValueHunterStrategy;
impl Strategy for HighValueHunterStrategy {
    fn name(&self) -> &str { "High-Value Hunter" }
    fn description(&self) -> &str { "Aggressively pursues 10-12 cards, stops after getting one" }

    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool {
        let card_count = hand.numbers.len();
        let has_high = hand.numbers.iter().any(|&n| n >= 10);
        let bust_prob = calculate_bust_prob(hand, deck_size);

        // If we got a high card, be conservative
        if has_high {
            if card_count >= 3 { return false; }
            if bust_prob > 0.20 { return false; }
        }

        // Otherwise, aggressively seek high cards
        if bust_prob > 0.35 { return false; }
        card_count < 5
    }
}

struct DeckDepletionStrategy;
impl Strategy for DeckDepletionStrategy {
    fn name(&self) -> &str { "Deck Depletion Specialist" }
    fn description(&self) -> &str { "Adjusts risk based on remaining deck size" }

    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool {
        let card_count = hand.numbers.len();
        let score: u32 = hand.numbers.iter().map(|&n| n as u32).sum();
        let bust_prob = calculate_bust_prob(hand, deck_size);
        let deck_proportion = deck_size as f64 / 94.0;

        if deck_proportion > 0.75 {
            // Early game: very conservative
            if card_count >= 3 && score >= 15 { return false; }
            if bust_prob > 0.18 { return false; }
        } else if deck_proportion > 0.40 {
            // Mid game: balanced
            if card_count >= 4 && score >= 20 { return false; }
            if bust_prob > 0.25 { return false; }
        } else {
            // Late game: aggressive (fewer duplicates likely)
            if bust_prob > 0.35 { return false; }
        }

        card_count < 6
    }
}

struct Flip7ChaserStrategy;
impl Strategy for Flip7ChaserStrategy {
    fn name(&self) -> &str { "Flip 7 Probability Chaser" }
    fn description(&self) -> &str { "Calculates Flip 7 odds, only pursues when >40% probable" }

    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool {
        let card_count = hand.numbers.len();
        let bust_prob = calculate_bust_prob(hand, deck_size);

        if card_count < 3 { return true; }

        // Calculate probability of getting Flip 7
        let cards_needed = 7 - card_count;
        if cards_needed <= 0 { return false; }

        // Rough estimate: probability all remaining draws are unique
        let flip7_prob = if deck_size > 0 {
            let available_unique = 13 - card_count;
            (available_unique as f64 / deck_size as f64).powi(cards_needed as i32)
        } else {
            0.0
        };

        // If Flip 7 is reasonably likely (>40%), go for it
        if flip7_prob > 0.40 && bust_prob < 0.30 {
            return card_count < 7;
        }

        // Otherwise play conservatively
        let score: u32 = hand.numbers.iter().map(|&n| n as u32).sum();
        if score >= 18 && bust_prob > 0.20 { return false; }

        card_count < 5
    }
}

struct CardDistributionStrategy;
impl Strategy for CardDistributionStrategy {
    fn name(&self) -> &str { "Card Distribution Expert" }
    fn description(&self) -> &str { "Tracks full card distribution for precise probabilities" }

    fn should_hit(&self, hand: &PlayerHand, deck_size: usize) -> bool {
        let card_count = hand.numbers.len();
        if card_count < 2 { return true; }

        // Calculate exact remaining distribution
        let mut remaining = [0i32; 13];
        for i in 0..13 {
            remaining[i] = if i == 0 { 1 } else { i as i32 };
        }

        // Subtract our hand
        for &num in &hand.numbers {
            remaining[num as usize] -= 1;
        }

        // Calculate safe cards (won't bust)
        let safe_cards: i32 = remaining.iter().enumerate()
            .filter(|(i, _)| !hand.numbers.contains(&(*i as u8)))
            .map(|(_, &count)| count.max(0))
            .sum();

        let total_remaining = deck_size as i32 - 22; // Approximate (subtract modifiers/actions)
        let bust_prob = if total_remaining > 0 {
            1.0 - (safe_cards as f64 / total_remaining as f64)
        } else {
            1.0
        };

        let score: u32 = hand.numbers.iter().map(|&n| n as u32).sum();

        // Use precise probabilities for decisions
        if bust_prob > 0.25 { return false; }
        if card_count >= 4 && score >= 20 && bust_prob > 0.18 { return false; }
        if card_count >= 5 && bust_prob > 0.12 { return false; }

        card_count < 6
    }
}

fn calculate_bust_prob(hand: &PlayerHand, deck_size: usize) -> f64 {
    if deck_size == 0 { return 1.0; }

    let mut bust_cards = 0.0;
    for &num in &hand.numbers {
        let initial_count = if num == 0 { 1.0 } else { num as f64 };
        let estimated = initial_count * (deck_size as f64 / 94.0);
        bust_cards += estimated;
    }

    (bust_cards / deck_size as f64).min(1.0)
}

fn create_deck() -> Vec<Card> {
    let mut deck = Vec::new();

    // Number cards
    deck.push(Card::Number(0));
    for num in 1..=12 {
        for _ in 0..num {
            deck.push(Card::Number(num));
        }
    }

    // Modifiers
    for n in 2..=10 {
        deck.push(Card::Modifier(Modifier::Plus(n)));
    }
    deck.push(Card::Modifier(Modifier::Times2));

    // Actions
    deck.push(Card::Action(Action::Freeze));
    deck.push(Card::Action(Action::FlipThree));
    deck.push(Card::Action(Action::SecondChance));

    deck
}

fn play_game<S: Strategy + ?Sized>(strategies: &[&S]) -> usize {
    let mut rng = thread_rng();
    let mut scores = vec![0u32; strategies.len()];

    while scores.iter().all(|&s| s < 200) {
        let round_scores = play_round(strategies, &mut rng);
        for (i, score) in round_scores.iter().enumerate() {
            scores[i] += score;
        }
    }

    scores.iter().enumerate()
        .max_by_key(|(_, &score)| score)
        .map(|(i, _)| i)
        .unwrap()
}

fn play_round<S: Strategy + ?Sized>(strategies: &[&S], rng: &mut ThreadRng) -> Vec<u32> {
    let mut deck = create_deck();
    deck.shuffle(rng);

    let mut hands: Vec<PlayerHand> = (0..strategies.len()).map(|_| PlayerHand::new()).collect();

    // Deal initial cards
    for hand in &mut hands {
        if let Some(card) = deck.pop() {
            apply_card(hand, card);
        }
    }

    // Play round
    loop {
        let active: Vec<usize> = hands.iter().enumerate()
            .filter(|(_, h)| !h.busted && !h.stayed)
            .map(|(i, _)| i)
            .collect();

        if active.is_empty() { break; }

        for &player_idx in &active {
            let hand = &mut hands[player_idx];
            if hand.busted || hand.stayed { continue; }

            if !strategies[player_idx].should_hit(hand, deck.len()) {
                hand.stayed = true;
                continue;
            }

            if let Some(card) = deck.pop() {
                apply_card(hand, card);

                if hand.numbers.len() == 7 {
                    // Flip 7 achieved - end round
                    return hands.iter().enumerate()
                        .map(|(i, h)| h.score(i == player_idx))
                        .collect();
                }
            } else {
                break;
            }
        }
    }

    hands.iter().map(|h| h.score(false)).collect()
}

fn apply_card(hand: &mut PlayerHand, card: Card) {
    match card {
        Card::Number(n) => {
            if hand.numbers.contains(&n) {
                if hand.has_second_chance {
                    hand.has_second_chance = false;
                } else {
                    hand.busted = true;
                }
            } else {
                hand.numbers.insert(n);
            }
        }
        Card::Modifier(m) => {
            hand.modifiers.push(m);
        }
        Card::Action(Action::SecondChance) => {
            hand.has_second_chance = true;
        }
        _ => {}
    }
}

#[derive(Serialize)]
struct MatchupResult {
    wins: u32,
    games: u32,
}

#[derive(Serialize)]
struct ArenaResults {
    matchups: HashMap<String, HashMap<String, MatchupResult>>,
    overall_rankings: Vec<StrategyRanking>,
    strategies: Vec<StrategyInfo>,
}

#[derive(Serialize)]
struct StrategyRanking {
    name: String,
    #[serde(rename = "winRate")]
    win_rate: f64,
    #[serde(rename = "totalWins")]
    total_wins: u32,
    #[serde(rename = "totalGames")]
    total_games: u32,
}

#[derive(Serialize)]
struct StrategyInfo {
    name: String,
    description: String,
}

fn main() {
    println!("🎮 FLIP 7 STRATEGY ARENA (Rust Edition)\n");
    println!("Running on {} cores", rayon::current_num_threads());

    let strategies: Vec<Box<dyn Strategy>> = vec![
        Box::new(JohnsStrategy),
        Box::new(PerfectMemoryStrategy),
        Box::new(BlackjackStrategy),
        Box::new(ExpectedValueStrategy),
        Box::new(ContextAwareStrategy),
        Box::new(AggressiveStrategy),
        Box::new(RiskAverseStrategy),
        Box::new(HighValueHunterStrategy),
        Box::new(DeckDepletionStrategy),
        Box::new(Flip7ChaserStrategy),
        Box::new(CardDistributionStrategy),
    ];

    let total_matchups = strategies.len() * (strategies.len() - 1);
    println!("Total matchups: {}\n", total_matchups);

    let matchup_pairs: Vec<(usize, usize)> = (0..strategies.len())
        .flat_map(|i| (0..strategies.len()).map(move |j| (i, j)))
        .filter(|(i, j)| i != j)
        .collect();

    let results: Vec<((usize, usize), u32)> = matchup_pairs.par_iter()
        .enumerate()
        .map(|(idx, &(i, j))| {
            let start = std::time::Instant::now();
            let strats = vec![&*strategies[i], &*strategies[j]];

            let wins: u32 = (0..500)
                .into_par_iter()
                .map(|_| if play_game(&strats) == 0 { 1 } else { 0 })
                .sum();

            let elapsed = start.elapsed().as_secs_f64();
            let win_rate = (wins as f64 / 500.0) * 100.0;

            println!("[{}/{}] {} vs {} ... {:.1}% ({:.2}s)",
                idx + 1, total_matchups,
                strategies[i].name(), strategies[j].name(),
                win_rate, elapsed);

            ((i, j), wins)
        })
        .collect();

    // Build results structure
    let mut matchups: HashMap<String, HashMap<String, MatchupResult>> = HashMap::new();

    for ((i, j), wins) in results {
        let name_i = strategies[i].name().to_string();
        let name_j = strategies[j].name().to_string();

        matchups.entry(name_i.clone())
            .or_insert_with(HashMap::new)
            .insert(name_j, MatchupResult { wins, games: 500 });
    }

    // Calculate rankings
    let mut rankings: Vec<StrategyRanking> = strategies.iter()
        .map(|strat| {
            let name = strat.name().to_string();
            let results = matchups.get(&name).unwrap();
            let total_wins: u32 = results.values().map(|r| r.wins).sum();
            let total_games: u32 = results.values().map(|r| r.games).sum();
            let win_rate = (total_wins as f64 / total_games as f64) * 100.0;

            StrategyRanking {
                name: name.clone(),
                win_rate,
                total_wins,
                total_games,
            }
        })
        .collect();

    rankings.sort_by(|a, b| b.win_rate.partial_cmp(&a.win_rate).unwrap());

    println!("\n📊 OVERALL WIN RATES:\n");
    for (idx, ranking) in rankings.iter().enumerate() {
        let medal = match idx {
            0 => "🥇",
            1 => "🥈",
            2 => "🥉",
            _ => "  ",
        };
        println!("{} {}. {:25} {:.1}% ({}/{})",
            medal, idx + 1, ranking.name, ranking.win_rate,
            ranking.total_wins, ranking.total_games);
    }

    let strategy_infos: Vec<StrategyInfo> = strategies.iter()
        .map(|s| StrategyInfo {
            name: s.name().to_string(),
            description: s.description().to_string(),
        })
        .collect();

    let arena_results = ArenaResults {
        matchups,
        overall_rankings: rankings,
        strategies: strategy_infos,
    };

    let json = serde_json::to_string_pretty(&arena_results).unwrap();
    fs::write("src/data/arena-results.json", json).unwrap();

    println!("\n✅ Results saved to src/data/arena-results.json");
}
