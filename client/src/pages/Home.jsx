import Hero from '../components/home/Hero.jsx';
import CloudportMap from '../components/home/CloudportMap.jsx';
import Passport from '../components/home/Passport.jsx';
import Crew from '../components/home/Crew.jsx';
import TalkToLumi from '../components/home/TalkToLumi.jsx';
import ChapterNext from '../components/story/ChapterNext.jsx';

// Home: meet Lumi, explore the Cloudport map, read the passport, spin 3D Lumi and chat, meet the crew.
export default function Home({ entered }) {
  return (
    <>
      <Hero entered={entered} />
      <CloudportMap />
      <Passport />
      <TalkToLumi />
      <Crew />
      <ChapterNext from="/" />
    </>
  );
}
