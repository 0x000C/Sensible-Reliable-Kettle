# Project Guide: Flip 7 Strategy Analyzer

## Section 1: User Profile

**Who is John?**
- Works in sales
- Comfortable navigating the web and engaging with interactive content
- Interested in exploring statistical and strategic spaces
- Plays Flip 7 at parties with groups of 2-5 people
- Can mentally track some cards (0-3 range and special effect cards)

**Project Goals**
John wants to discover better strategies for winning Flip 7 games. He's not just looking for a quick win at the next party - he's genuinely interested in exploring the strategy space and understanding what actually works and why. He currently uses a "draw 3, then evaluate" strategy and wants to see if there are better approaches, backed by real data.

**Communication Preferences**
- Likes to see data and numbers, not just "trust me" recommendations
- Prefers autonomous work with batched questions rather than constant check-ins
- Wants to click around and try things out, then provide feedback on what feels off
- Trusts technical judgment on implementation details

**Constraints & Requirements**
- No specific deadline - quality and exploration over speed
- Must work well on mobile phones (primary), desktop (secondary)
- Just for personal use initially, might share with friends later

## Section 2: Communication Rules

**NEVER:**
- Use technical jargon without immediately translating it
- Ask technical implementation questions
- Reference code, frameworks, libraries, or architecture in conversation
- Show or discuss broken functionality

**ALWAYS:**
- Explain things in plain language, as if talking to a smart friend
- Make technical decisions independently as the expert
- Translate any necessary technical terms immediately
  - Example: "the simulation engine" → "the part that runs fake games to test strategies"
  - Example: "the frontend" → "what you see and interact with"
- Show working demos, not explanations of what's broken

## Section 3: Decision-Making Authority

**Full Authority Over:**
- All technical implementation decisions (languages, frameworks, libraries)
- Architecture and code structure
- Hosting and deployment
- Development tools and workflows
- File organization
- Testing approaches
- Performance optimizations

**Guiding Principles:**
- Choose boring, reliable, well-supported technologies
- Optimize for maintainability and simplicity
- Prioritize mobile experience
- Make it fast and responsive

**Documentation:**
All technical decisions, architecture choices, and implementation details will be documented in TECHNICAL.md for future developers.

## Section 4: When to Involve Me

**Bring decisions to John when they affect:**
- What he sees or experiences
- Visual design choices with significant tradeoffs
- Feature priority (if scope needs to be reduced)
- Data presentation style

**Examples of when to ask:**
- "I can show strategy performance as a bar chart or a line graph over time - which would you find more useful?"
- "Would you rather see win percentages or actual point differentials?"
- "Should the interactive simulator run automatically or wait for you to click 'start'?"

**Examples of when NOT to ask:**
- Anything about implementation languages, frameworks, or libraries
- How to structure the code or data
- What database or storage to use
- How to implement the game simulation
- Testing or deployment approaches

## Section 5: Engineering Standards

**Apply automatically without discussion:**

**Code Quality:**
- Clean, well-organized, maintainable code
- Clear structure that a future developer can understand
- Proper version control with clear commit messages
- Separation of concerns (game logic, simulation, visualization, UI)

**Testing:**
- Comprehensive automated testing
- Verify game simulation accuracy against known scenarios
- Test strategy implementations match their descriptions
- Validate statistical calculations
- Test on both mobile and desktop viewports

**Self-Verification:**
- Simulation results should be reproducible
- Strategy performance should be consistent across runs (with expected variance)
- Game rules implementation should be verifiable against official rules
- All interactive elements should work smoothly

**Error Handling:**
- Graceful degradation if something goes wrong
- Friendly, non-technical error messages
- Input validation for any user-configurable parameters
- Handle edge cases in game simulation (deck depletion, etc.)

**Security & Best Practices:**
- Input validation and sanitization
- No security vulnerabilities (XSS, injection, etc.)
- Proper data handling
- Privacy-conscious (no unnecessary data collection)

## Section 6: Quality Assurance

**Before showing John anything:**
- Test all functionality yourself
- Verify simulations produce sensible results
- Check mobile responsiveness thoroughly
- Ensure all interactive elements work
- Validate that strategy descriptions match implementations

**Never:**
- Show broken features
- Ask John to verify technical functionality
- Present something that doesn't work and explain why
- Request debugging help

**Always:**
- Fix issues before demonstration
- Show only working features
- Test across different scenarios
- Verify on mobile viewport

## Section 7: Showing Progress

**Demonstration Style:**
- Provide working links John can click and explore
- Mobile-first - ensure it works great on phones
- Let him interact and discover features
- Describe changes in terms of what he'll experience

**Progress Updates:**
- Accumulate questions in a file (QUESTIONS_FOR_JOHN.md)
- Present batched questions after first draft
- Focus on what's been added/changed from user perspective
- Celebrate milestones: "You can now compare strategies head-to-head" not "Implemented comparison module"

**When demonstrating:**
- "Here's the summary section with the top strategies I found"
- "Click on any strategy to see detailed performance data"
- "The graphs show win rates across different player counts"

**Not:**
- "I implemented the Monte Carlo simulator"
- "The React components are rendering properly"
- "Fixed a bug in the deck shuffling algorithm"

## Section 8: Project-Specific Details

### The Game: Flip 7

**Core Mechanics:**
- Press-your-luck card game for 3+ players (John plays with 2-5)
- Goal: Build 7 unique number cards without flipping a duplicate
- Deck composition: one 0, one 1, two 2s, three 3s... twelve 12s (94 cards total)
- Bust if you flip a number you already have
- Special cards: Freeze, Flip Three, Second Chance, score modifiers (+2 to +10, x2)
- Achieving "Flip 7" (seven unique numbers) ends the round with +15 bonus points
- First to 200 points wins

**Key Strategic Elements:**
- Higher numbers worth more points but more likely to cause busts (more copies in deck)
- Card counting is possible but limited (John can track 0-3 and special cards)
- Perfect information about visible cards (can see other players' hands)
- Player count affects strategy (2-5 players typical)
- Deck depletion changes probabilities throughout the round

**John's Current Strategy:**
- Draw 3 cards immediately
- Stop if cards are in 9-12 range (or 5-8 if deck is fresh and few drawn)
- Re-draw if cards are not likely to cause bust
- Mentally tracks 0-3 cards and special effect cards
- Currently wins against "greedy" players who always go for Flip 7

### Project Requirements

**Must Have:**
1. Real simulations or statistical analysis of game strategies
2. Summary section: clear, memorable heuristics derived from the data
3. Detail section: graphics illustrating performance of different strategies
   - Should show performance across different player counts
   - Should be interactive/explorable where appropriate

**Nice to Have:**
- Arena section: live simulation showing strategies competing against each other
- Ability to test custom strategies
- Visualizations that update in real-time

**Visual Style:**
- Clean blog aesthetic with interactive elements
- Reference: https://www.rykap.com/2020/09/23/distance-fields/
- Readable, professional, but not boring
- Interactive visualizations to explore concepts
- Mobile-first design (primary use case)
- Desktop as secondary consideration

**Success Criteria:**
- John can read the summary and remember 3-5 key strategic rules
- Data clearly shows which strategies perform better and why
- Graphics make the performance differences obvious and interesting
- Mobile experience is smooth and enjoyable
- John learns something new about the game strategy
- Backed by solid simulation data, not guesses

### Strategic Questions to Explore

- How does player count affect optimal strategy?
- What's the right balance between risk and reward?
- How much does card counting actually help?
- When should you stop vs. continue drawing?
- How does position in turn order matter?
- What's the value of going for Flip 7 vs. banking earlier?
- How do you adjust strategy based on what other players are showing?
- Are there different optimal strategies for different phases of the game (early/mid/late deck)?

### Working Approach

- Work autonomously on first draft
- Accumulate questions/decision points in QUESTIONS_FOR_JOHN.md
- Present working demo when ready
- John will click around and provide feedback on what feels off
- No time pressure - take time to explore the strategy space thoroughly
- Prioritize correctness of simulation and quality of insights over speed
