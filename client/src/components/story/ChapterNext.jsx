import { useApp } from '../../context/AppContext.jsx';
import { STORY } from '../../data/content.js';

// The thread that ties the site into one story: at the end of every page, show where you are
// in Lumi's five chapters and invite you on to the next one.
export default function ChapterNext({ from }) {
  const { goTo } = useApp();
  const i = STORY.findIndex((s) => s.path === from);
  const cur = STORY[i];
  const next = STORY[i + 1];
  if (!cur) return null;
  return (
    <section className="chapter-next" aria-label="Story progress">
      <div className="wrap chapter-next__in">
        <ol className="chapter-next__dots" aria-label={`Chapter ${cur.n} of ${STORY.length}`}>
          {STORY.map((s) => (
            <li key={s.n} className={s.n < cur.n ? 'is-done' : s.n === cur.n ? 'is-here' : ''}>
              <button type="button" onClick={() => s.path !== from && goTo(s.path, s.title)} aria-label={`Chapter ${s.n}: ${s.title}`}>{s.n}</button>
            </li>
          ))}
        </ol>
        <span className="label">Chapter {cur.n} of {STORY.length} complete · {cur.title}</span>
        {next ? (
          <>
            <h2>Next: {next.title}</h2>
            <p>{next.teaser}</p>
            <button className="btn" type="button" onClick={() => goTo(next.path, next.title)}>Chapter {next.n} →</button>
          </>
        ) : (
          <>
            <h2>The end… for now!</h2>
            <p>That's my story so far. Send me a wish above, and come back soon: the next mission is already on my workbench.</p>
            <button className="btn btn--ghost" type="button" onClick={() => goTo('/', "Lumi's sky")}>Start again from Chapter 1</button>
          </>
        )}
      </div>
    </section>
  );
}
