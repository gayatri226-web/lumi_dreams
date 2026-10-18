import PageHero from '../components/fx/PageHero.jsx';
import Story from '../components/journey/Story.jsx';

// Journey: Lumi's origin story, told by scrolling down from the Moon, ending in a rocket launch.
export default function Journey() {
  return (
    <>
      <PageHero kicker="My story" title="How a moon crumb learned to fly" accent="fly"
        text="Four little scenes and one big launch. Scroll slowly, it's a long way down from the Moon."
        sign="Launchpad →" />
      <Story />
    </>
  );
}
