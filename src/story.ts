export type FicturnStory = {
  id: string;
  title: string;
  subtitle: string;
  hook: string;
  tags: string[];
  readingMinutes: number;
  fragments: string[];
};

export const story: FicturnStory = {
  id: "the-safehouse-rule",
  title: "The Safehouse Rule",
  subtitle: "A short second-chance romantic suspense story",
  hook: "You were told not to leave the safehouse until dawn. Nobody mentioned that the only other person inside would be the man who once broke your heart.",
  tags: ["Second chance", "Forced proximity", "Romantic suspense"],
  readingMinutes: 6,
  fragments: [
    `The rain turns the coastal road into black glass.

Your phone is sealed in an evidence bag on the seat beside you. The driver has said exactly eleven words since the station: “We’re here. Keep your head down. Someone will meet you inside.”

The safehouse is smaller than you expected. A dark cottage above the sea, one porch light, no neighbouring windows. You run the three metres from the car to the door with your coat over your head.

It opens before you knock.

Noah Mercer looks exactly like someone you spent eighteen months trying not to remember.

Not exactly. His hair is shorter. There is a pale line beside his left eyebrow that wasn’t there before. But the expression is the same: calm enough to make you angry.

“You’re late,” he says.

You stare at him.

The driver is already reversing down the track.

“No.”

Noah glances past you at the disappearing taillights. “That’s going to make the next six hours difficult.”

“I was told there’d be a security officer.”

“There is.”

“I wasn’t told it was you.”

“I know.”

Eighteen months ago, Noah ended things in seven words — I can’t do this anymore. I’m sorry — and disappeared from your life before you had the chance to decide whether to hate him.

Now he steps aside.

Behind him: a narrow hallway, one lamp, two mugs already waiting on a kitchen table.

Outside, thunder rolls over the sea.

“Come in,” he says. “And once you do, we don’t open this door again until six.”`,

    `The first rule of the safehouse is simple: no one gets in.

The second is worse: no one gets out.

Noah locks the door, slides a steel bolt into place and checks the windows one by one. You watch him work because watching is easier than asking why he is here.

On the kitchen table he has made coffee exactly the way you used to drink it.

“You remembered.”

“I remember most things.”

You leave the mug untouched.

He sits opposite you, close enough that the table feels much smaller than it is.

“The person who gave you the ledger was followed,” he says. “We don’t know by whom. Until the prosecutor moves you in the morning, this location is compartmentalised. No calls. No Wi-Fi. No lights near the windows.”

“You volunteered for this.”

It isn’t a question.

His eyes lift to yours.

“Yes.”

“Why?”

“Because I know the case.”

“You knew the case eighteen months ago too.”

For the first time, something moves behind his expression.

You feel the old anger arrive with almost embarrassing precision. Not because he left. Because some part of you had kept expecting an explanation long after you stopped admitting it.

“Noah.”

“Not tonight.”

You laugh once. “You don’t get to choose when I ask.”

“No.” He looks down at his hands. “But I can choose not to lie to you again.”

Again.

The word lands between you.

Before you can answer, every light in the cottage goes out.`,

    `For three seconds there is only darkness and the sound of rain on the roof.

Then Noah is beside you.

“Stay here.”

“Absolutely not.”

A small torch clicks on in his hand. He doesn’t argue. That worries you more than if he had.

The generator panel is in a cupboard under the stairs. Noah crouches in front of it while you hold the light. His shoulder presses briefly against your knee. Your body remembers him before your mind can object.

“The generator didn’t fail,” he says.

“What does that mean?”

“It means someone cut the exterior feed.”

The cottage becomes suddenly very quiet.

He stands and you are closer than either of you intended. The torch is between you, throwing light upward across his face.

“You should have told me,” you say.

“This is not the moment.”

“It seems to be the only moment I’m going to get.”

His jaw tightens.

Then, somewhere outside, gravel shifts.

Noah kills the torch.

His hand finds yours in the dark and pulls you back against the wall. You can feel his breathing. Slow. Controlled. Yours is neither.

The sound comes again, passes the side of the house, then fades toward the cliff.

A minute later his secure radio vibrates. He checks it.

“Perimeter team,” he whispers. “False alarm. They cut power while checking a damaged line.”

You exhale.

But Noah doesn’t move away.

“You asked why I left,” he says quietly.

“Yes.”

“I found out someone inside your source network was using my movements to track you.”

The darkness seems to tilt.

He continues.

“And I was told the safest thing I could do was disappear.”`,

    `The lights return with a soft mechanical hum.

Noah steps back first.

You wish he hadn’t.

“So that was it?” you say. “You vanished to protect me?”

“No.”

The answer surprises you.

He leans against the wall, exhausted suddenly, as if the last eighteen months have caught up with him all at once.

“I vanished because they told me it would protect you. I stayed gone because every week I waited made it harder to admit I’d handled it badly.”

“That’s considerably less heroic.”

“I know.”

“You could have sent one message.”

“I know.”

“You let me think I meant nothing to you.”

His face changes.

“That,” he says, “was the lie.”

For a moment neither of you speaks.

The rain has weakened. Somewhere beyond the black windows, the sea keeps moving as if none of this matters.

“You protected me from everything except you,” you say.

Noah closes his eyes briefly.

“I know that too.”

There is no clever defence. No grand speech. You realise that is what makes it difficult to stay angry in the clean, uncomplicated way you had rehearsed.

“Why did you volunteer tonight?”

He looks at you.

“Because when I heard your name on the protection request, I knew that if something happened to you while I was somewhere else, I’d spend the rest of my life pretending I could live with it.”

The clock over the kitchen door reads 4:48.

Seventy-two minutes until the lock opens.

You finally pick up the coffee he made for you.

It is cold.

You drink it anyway.`,

    `At 5:59, the cottage looks ordinary again.

Two mugs. Grey dawn against the windows. Noah’s jacket over the back of a chair.

The radio confirms that the car is waiting at the bottom of the track.

Noah removes the steel bolt but keeps his hand on the door.

“What happens at six?” you ask.

“You go to the prosecutor’s office.”

“And you?”

“I go back to being the man you don’t have to see.”

“That wasn’t what I asked.”

He looks at you carefully, as if there might be a correct answer and he has finally learned not to invent one.

“I don’t know.”

You nod.

Then you take your coat from the hook.

“Coffee,” you say.

He blinks. “There’s coffee in the car.”

“Not this morning.”

Understanding reaches him slowly.

“One coffee,” you continue. “Somewhere public. No locked doors. No security briefings. You answer every question I ask, including the ones you hate.”

A smile touches the corner of his mouth.

“That sounds less like coffee and more like an interrogation.”

“You’re free to decline.”

“I’m not going to.”

Outside, the rain has stopped.

Noah opens the door. Cold air enters the hallway, carrying salt and wet earth and the first ordinary sounds of morning.

You step onto the porch, then realise he hasn’t followed.

He is looking at you as though he still doesn’t quite believe he has been given another hour, let alone another chance.

“Well?” you say.

He comes outside.

At six o’clock, the lock clicks shut behind you.

This time, neither of you disappears.`
  ]
};

export function getFragment(part: number) {
  const index = part - 1;
  if (!Number.isInteger(part) || index < 0 || index >= story.fragments.length) {
    throw new Error(`Invalid fragment ${part}`);
  }
  return story.fragments[index];
}
