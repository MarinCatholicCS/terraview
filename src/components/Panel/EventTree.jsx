export default function EventTree({ events }) {
  if (!events) return null;

  return (
    <div className="event-tree">
      <div className="section-label">Chain of Consequences</div>
      <div className="event-tree-container">
        <EventNode node={events} isRoot />
      </div>
    </div>
  );
}

function EventNode({ node, isRoot }) {
  if (!node) return null;

  const children = (node.children || []).filter(Boolean);

  return (
    <div className={`event-node${isRoot ? ' event-root' : ''}`}>
      <div className="event-node-content">
        <span className="event-year">{node.year}</span>
        <span className="event-text">{node.event}</span>
      </div>
      {children.length > 0 && (
        <div className="event-children">
          {children.map((child, i) => (
            <EventNode key={i} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}
