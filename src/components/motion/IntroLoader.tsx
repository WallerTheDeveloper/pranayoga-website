/** How long the class stays on <html>: hold (1 s) + lift (0.6 s) + the hero entrance after it. */
export const INTRO_CLASS_MS = 2600

/**
 * Marks a first visit before the first paint. "First visit" means a fresh navigation that did
 * not come from this site: reloads, back/forward and internal links never show the loader. No
 * storage is used, so nothing needs consent. Reduced motion skips it entirely.
 */
export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(n&&n.type!=='navigate')return;var r=document.referrer;if(r){try{if(new URL(r).origin===location.origin)return}catch(e){}}d.classList.add('intro');setTimeout(function(){d.classList.remove('intro')},${INTRO_CLASS_MS})}catch(e){}})();`

interface IntroLoaderProps {
  word: string
}

/**
 * First-visit loader (feature flag `introLoader`): "Prana" in the breath ring for at most
 * 1.2 s, then the linen panel lifts away over 600 ms. Pure CSS once the script has run.
 */
export function IntroLoader({ word }: IntroLoaderProps) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <div className="intro-loader" aria-hidden="true">
        <div className="intro-ring breath" />
        <p className="serif intro-word" lang="sa">
          {word}
        </p>
      </div>
    </>
  )
}
