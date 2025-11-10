import React from "react"

export default function GroupItem({ group, onOpen }) {
  const id = group._id || group.id
  return (
    <div className="group-item" onClick={() => onOpen(id)} role="button" tabIndex={0}>
      <div className="group-placeholder">{(group.name || "").charAt(0).toUpperCase()}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700 }}>{group.name}</div>
        <div style={{ fontSize: ".85rem", color: "var(--text-secondary,#667781)" }}>{group.members?.length || "0"} miembros</div>
      </div>
    </div>
  )
}