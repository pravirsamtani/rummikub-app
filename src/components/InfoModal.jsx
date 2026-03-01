const SECTION_STYLE = {
  marginBottom: 20,
};

const LABEL_STYLE = {
  fontSize: 13,
  fontWeight: 700,
  color: '#f4d03f',
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: 6,
};

const TEXT_STYLE = {
  fontSize: 13,
  color: '#cbd5e0',
  lineHeight: 1.6,
  margin: 0,
};

function TileDemo({ color, label }) {
  const COLORS = ['#E63946', '#2196F3', '#FF9800', '#2E7D32'];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 36,
      borderRadius: 5,
      background: 'linear-gradient(145deg, #fffff8, #f0ede0)',
      border: `2px solid ${COLORS[color]}`,
      fontSize: 13,
      fontWeight: 800,
      color: COLORS[color],
      fontFamily: 'Georgia, serif',
      margin: '0 2px',
    }}>
      {label}
    </span>
  );
}

function JokerDemo() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 36,
      borderRadius: 5,
      background: 'linear-gradient(145deg, #12001a, #1a002a)',
      border: '2px solid #f4d03f88',
      fontSize: 16,
      margin: '0 2px',
    }}>
      ★
    </span>
  );
}

export default function InfoModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
          border: '1.5px solid #ffffff22',
          borderRadius: 16,
          padding: '32px 36px',
          maxWidth: 480,
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          fontFamily: 'Georgia, serif',
        }}
      >
        <h2 style={{ color: '#f4d03f', fontSize: 22, margin: '0 0 24px', letterSpacing: 1 }}>
          How to Play
        </h2>

        <div style={SECTION_STYLE}>
          <div style={LABEL_STYLE}>Runs</div>
          <p style={TEXT_STYLE}>
            3 or more tiles of the <strong style={{ color: '#e2e8f0' }}>same color</strong> in
            consecutive numbers.
          </p>
          <div style={{ marginTop: 8, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TileDemo color={0} label="4" />
            <TileDemo color={0} label="5" />
            <TileDemo color={0} label="6" />
            <TileDemo color={0} label="7" />
          </div>
        </div>

        <div style={SECTION_STYLE}>
          <div style={LABEL_STYLE}>Groups</div>
          <p style={TEXT_STYLE}>
            3 or 4 tiles of the <strong style={{ color: '#e2e8f0' }}>same number</strong> in
            different colors. Max one of each color.
          </p>
          <div style={{ marginTop: 8, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TileDemo color={0} label="9" />
            <TileDemo color={1} label="9" />
            <TileDemo color={2} label="9" />
            <TileDemo color={3} label="9" />
          </div>
        </div>

        <div style={SECTION_STYLE}>
          <div style={LABEL_STYLE}>Jokers ★</div>
          <p style={TEXT_STYLE}>
            A joker is a wildcard — it counts as any tile and makes a group valid.
            You can move jokers between groups just like regular tiles.
          </p>
          <div style={{ marginTop: 8, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TileDemo color={2} label="5" />
            <JokerDemo />
            <TileDemo color={2} label="7" />
            <span style={{ color: '#718096', fontSize: 12, marginLeft: 6 }}>← joker acts as Orange 6</span>
          </div>
        </div>

        <div style={SECTION_STYLE}>
          <div style={LABEL_STYLE}>Goal</div>
          <p style={TEXT_STYLE}>
            Place all tiles from your hand onto the board.
            Every group on the board must be a valid run or group when you're done.
            Groups glow <span style={{ color: '#0f6' }}>green</span> when valid and
            <span style={{ color: '#f44' }}> red</span> when invalid.
          </p>
        </div>

        <div style={SECTION_STYLE}>
          <div style={LABEL_STYLE}>Moving tiles</div>
          <p style={TEXT_STYLE}>
            Drag any tile to a different group to rearrange the board.
            Drop onto the board background to start a new group.
            Groups can be temporarily invalid while you're rearranging — only the final state matters.
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 8,
            padding: '10px 28px',
            borderRadius: 8,
            background: 'linear-gradient(90deg, #f4d03f, #f39c12)',
            border: 'none',
            color: '#1a1a2e',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
