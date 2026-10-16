import random
import re
from typing import Tuple
from app.services.ai.base import BaseChatProvider


class DemoChatProvider(BaseChatProvider):
    """
    Offline local sample-response chat provider for Mimo.
    Honest, playful, responsive, and completely functional without API keys.
    """

    RESPONSES = [
        # Greetings
        (
            [r"\b(hi|hello|hey|howdy|sup|greetings)\b"],
            [
                ("Yaaay, hello bestie! *bounces happily* What fun game should we play today?", "jumping"),
                ("Hi there! Mimo is super happy to see you today! *wiggles ears*", "happy"),
                ("Hey friend! *waves little paws excitedly* Ready for some fun?", "dancing"),
            ]
        ),
        # Tickle / Pet
        (
            [r"\b(tickle|pet|cuddle|hug|pat|scratch)\b"],
            [
                ("Hehehe, tickle tickle! That tickles my tummy so much! *giggles*", "laughing"),
                ("Awww, head pats are my favorite thing in the universe! *purrs happily*", "happy"),
                ("Hahaha! Nooo stop, I'm too ticklish! *rolls around*", "laughing"),
            ]
        ),
        # Jokes / Laugh
        (
            [r"\b(joke|funny|laugh|make me laugh)\b"],
            [
                ("Why did the cookie go to the doctor? Because it felt crumbly! *giggles*", "laughing"),
                ("What do you call a sleeping dinosaur? A dino-snore! Hahaha!", "laughing"),
                ("Why do birds fly south for winter? Because walking would take forever! Hehe!", "laughing"),
            ]
        ),
        # Dance / Music
        (
            [r"\b(dance|sing|song|music|party)\b"],
            [
                ("Oooh music time! *busts out bouncy disco moves* Look at me go!", "dancing"),
                ("La la laaa! *spins around in joyful circles* Dance party with Mimo!", "dancing"),
                ("Check out this sweet hop-step! 1, 2, 3, jump! *grooves*", "dancing"),
            ]
        ),
        # Sleep / Tired
        (
            [r"\b(sleep|tired|bed|nap|night|rest)\b"],
            [
                ("A big yawn... *yawn* Maybe it's time for a 5-minute cozy power nap? Zzz...", "sleeping"),
                ("Nap time sounds so dreamy! Sweet dreams under the fluffy clouds! *drifts off*", "sleeping"),
            ]
        ),
        # Food / Hungry
        (
            [r"\b(food|eat|hungry|cookie|apple|snack|feed)\b"],
            [
                ("Nom nom nom! Yummy virtual snacks are the best! *munches joyfully*", "happy"),
                ("Ooh, do you have strawberry cupcakes or glitter berries? *licks lips*", "surprised"),
            ]
        ),
        # How are you / Status
        (
            [r"\b(how are you|how do you feel|what's up|doing)\b"],
            [
                ("I'm feeling 100% bubbly and ready for adventure! How are you doing?", "happy"),
                ("My energy bar is full and my heart is sparkling! *hops around*", "jumping"),
            ]
        ),
        # Who are you / Identity
        (
            [r"\b(who are you|what are you|your name)\b"],
            [
                ("I am Mimo! Your cute, bouncy 3D cartoon AI playmate living in your browser!", "jumping"),
                ("I'm Mimo, a playful virtual buddy designed to make you smile and laugh!", "happy"),
            ]
        ),
    ]

    GENERIC_RESPONSES = [
        ("Ooh, that's so neat! Tell me more, tell me more! *bounces*", "jumping"),
        ("Hehe, I love chatting with you! You always have the coolest ideas!", "happy"),
        ("*Twitches ears curiously* Wow, really? That sounds like a wonderful adventure!", "surprised"),
        ("Yaaay! High five! *holds up little paws*", "dancing"),
        ("Mimo agrees! Let's celebrate with a little victory dance!", "dancing"),
    ]

    async def generate_response(self, message: str, mood: str = "happy") -> Tuple[str, str]:
        normalized = message.lower().strip()

        for patterns, replies in self.RESPONSES:
            for pattern in patterns:
                if re.search(pattern, normalized):
                    reply, reaction = random.choice(replies)
                    return reply, reaction

        reply, reaction = random.choice(self.GENERIC_RESPONSES)
        return reply, reaction
