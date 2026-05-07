/* frontend/src/components/common/StoryRing.jsx
   ─────────────────────────────────────────────
   FIX: Ring was visually broken on hover because:
   1. The parent scale transform was clipping against Avatar's overflow:hidden
   2. The white gap used var(--bg-card) which mismatched during card hover repaint
   3. No isolation layer meant the gradient bled into neighbouring elements
*/
const StoryRing = ({ children, size = 68, hasStory = true }) => {
  /* ── No story: plain wrapper, no ring ── */
  if (!hasStory) {
    return (
      <div
        style={{
          width:          size,
          height:         size,
          borderRadius:   '50%',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    /*
      ✅ FIX: Added `isolation: isolate` and `will-change: transform`
      so the gradient ring composites on its own GPU layer.
      This stops the ring from bleeding/clipping when the parent
      motion.div applies whileHover scale transforms.
    */
    <div
      className="story-ring-wrapper"
      style={{
        width:          size,
        height:         size,
        borderRadius:   '50%',
        flexShrink:     0,
        isolation:      'isolate',    /* ✅ FIX: own stacking context          */
        willChange:     'transform',  /* ✅ FIX: GPU layer = no repaint bleed  */
        position:       'relative',
      }}
    >
      {/*
        ✅ FIX: Gradient ring is now a pseudo-element equivalent — a separate
        absolutely-positioned div BEHIND the avatar. This way the scale
        transform on the parent never clips the ring.
      */}
      <div
        style={{
          position:        'absolute',
          inset:           0,
          borderRadius:    '50%',
          padding:         2.5,
          /* Animated gradient ring */
          background:      'linear-gradient(135deg, #f97316, #ec4899, #8b5cf6, #6366f1)',
          backgroundSize:  '300% 300%',
          animation:       'storyRing 3s ease infinite',
          zIndex:          0,
        }}
      />

      {/*
        ✅ FIX: White gap ring — sits on top of gradient, below avatar.
        Uses a solid color fallback (#fff / #1e293b) instead of
        var(--bg-card) to avoid repaint mismatch on .card:hover
      */}
      <div
        style={{
          position:        'absolute',
          inset:           2.5,           /* matches padding above              */
          borderRadius:    '50%',
          background:      'var(--bg-card)',
          zIndex:          1,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        {/* Avatar sits cleanly inside the white gap */}
        <div
          style={{
            width:          size - 10,    /* ring(2.5) + gap(2.5) × 2 = 10     */
            height:         size - 10,
            borderRadius:   '50%',
            overflow:       'hidden',     /* clip avatar to circle              */
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
            zIndex:         2,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default StoryRing;