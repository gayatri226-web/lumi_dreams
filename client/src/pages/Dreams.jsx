import PageHero from '../components/fx/PageHero.jsx';
import ChapterNext from '../components/story/ChapterNext.jsx';
import DreamOrbits from '../components/dreams/DreamOrbits.jsx';
import Guestbook from '../components/dreams/Guestbook.jsx';

// Dreams: where Lumi is going next, and the Wish Post Office guestbook.
export default function Dreams() {
  return (
    <>
      <PageHero kicker="Chapter 5 · What's next" title="Where I'm flying next" accent="next"
        text="Catch my dreams as they orbit, then post me a wish. I read every single one at bedtime."
        sign="Shhh · dreaming" />
      <DreamOrbits />
      <Guestbook />
      <ChapterNext from="/dreams" />
    </>
  );
}
