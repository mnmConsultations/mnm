'use client';

import { useState } from 'react';

/**
 * Icon Picker Component
 * 
 * A comprehensive emoji/icon picker for categories and tasks
 * Organizes icons into logical groups for easy selection
 * Includes search functionality and recent selections
 */

const ICON_GROUPS = {
  'Popular': ['📋', '✈️', '🏠', '📝', '💼', '🎯', '📍', '🗺️', '🌍', '🏢', '🏛️', '🏥', '🏦', '🏪', '🎓', '👥'],
  'Travel & Places': ['✈️', '🛫', '🛬', '🗺️', '🧳', '🎒', '🏨', '🏠', '🏢', '🏛️', '🏙️', '🌆', '🌃', '🌉', '🗼', '🏰', '⛪', '🕌', '🛕', '🗽', '⛩️', '🏞️', '🏜️', '🏖️', '🏝️'],
  'Documents': ['📋', '📝', '📄', '📃', '📑', '📊', '📈', '📉', '📇', '🗂️', '📁', '📂', '🗃️', '🗄️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚'],
  'Office & Work': ['💼', '👔', '🎯', '📌', '📍', '🖊️', '✏️', '🖍️', '🖌️', '📐', '📏', '🔗', '📎', '🖇️', '✂️', '📦', '📫', '📪', '📬', '📭', '📮', '🏢', '🏛️', '🏦', '🏪'],
  'Communication': ['📞', '☎️', '📱', '📲', '💬', '💭', '🗨️', '🗯️', '💌', '📧', '📨', '📩', '📤', '📥', '📮', '📬', '📪', '📫', '📭', '🔔', '🔕', '📣', '📢', '📡'],
  'People & Family': ['👤', '👥', '👨', '👩', '👶', '👪', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '🧑', '👱', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲'],
  'Money & Finance': ['💰', '💵', '💴', '💶', '💷', '💳', '💸', '🏦', '🏧', '💹', '💱', '💲', '🪙', '💎', '⚖️'],
  'Education': ['🎓', '📚', '📖', '📕', '📗', '📘', '📙', '📔', '📒', '📝', '✏️', '🖊️', '🖍️', '📐', '📏', '🔬', '🔭', '🧪', '🧬', '🧮', '🎒', '🏫', '🏛️'],
  'Health': ['🏥', '⚕️', '🩺', '💊', '💉', '🩹', '🩼', '🦷', '🧬', '🔬', '🧪', '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '❤️', '💚', '💙', '💜'],
  'Food & Dining': ['🍽️', '🍴', '🥄', '🔪', '🥢', '🍕', '🍔', '🌭', '🥪', '🥗', '🍝', '🍜', '🍲', '🥘', '🍱', '🍛', '🍣', '🍱', '🥟', '🍦', '☕', '🍵', '🥤'],
  'Transportation': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🚇', '🚊', '🚝', '🚞', '🚋', '🚃', '🚟', '🚠', '🚡', '🛶', '⛵', '🚤', '🛥️', '⛴️'],
  'Nature': ['🌍', '🌎', '🌏', '🌐', '🗺️', '🧭', '⛰️', '🏔️', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🌳', '🌲', '🌴', '🌱', '🌿', '☘️', '🍀', '🌾', '🌵'],
  'Time & Calendar': ['⏰', '⏱️', '⏲️', '⏳', '⌛', '🕰️', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '📅', '📆', '🗓️', '📇'],
  'Tools': ['🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🗜️', '⚗️', '🔬', '🔭', '📡', '💡', '🔦', '🕯️', '🪔', '🔌', '🔋', '🧰', '🧲'],
  'Security & Legal': ['🔐', '🔒', '🔓', '🔑', '🗝️', '🛡️', '⚖️', '⚔️', '🔱', '📜', '✍️', '📋', '📝', '🆔', '🪪', '🏛️'],
  'Shopping': ['🛒', '🛍️', '💳', '💰', '💵', '🏪', '🏬', '🏢', '🏛️', '🎁', '🎀', '🛍️', '📦', '📫', '🏷️'],
  'Sports & Hobbies': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🪁', '🎯', '🎮', '🎲', '🎭', '🎨', '🎬', '🎪', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻'],
  'Symbols': ['✅', '❌', '⭐', '⚡', '🔥', '💥', '✨', '💫', '⭐', '🌟', '💯', '✔️', '☑️', '❗', '❓', '❕', '❔', '‼️', '⁉️', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤'],
  'Arrows & Shapes': ['➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '🔄', '🔃', '🔁', '🔂', '▶️', '◀️', '🔼', '🔽', '⏫', '⏬', '⏸️', '⏹️', '⏺️', '⏏️', '🔀', '🔁', '🔂'],
};

const IconPicker = ({ value = '', onChange, placeholder = 'Select an icon' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Popular');
  const [recentIcons, setRecentIcons] = useState(() => {
    // Load recent icons from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentIcons');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleSelectIcon = (icon) => {
    onChange(icon);
    
    // Add to recent icons (max 16)
    const updatedRecent = [icon, ...recentIcons.filter(i => i !== icon)].slice(0, 16);
    setRecentIcons(updatedRecent);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentIcons', JSON.stringify(updatedRecent));
    }
    
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClearIcon = () => {
    onChange('');
    setIsOpen(false);
  };

  // Filter icons based on search
  const getFilteredIcons = () => {
    if (!searchTerm) {
      return ICON_GROUPS[selectedGroup] || [];
    }

    // Search across all groups
    const allIcons = Object.values(ICON_GROUPS).flat();
    return allIcons.filter((icon, index, self) => 
      self.indexOf(icon) === index // Remove duplicates
    );
  };

  const filteredIcons = getFilteredIcons();

  return (
    <div className="relative">
      {/* Selected Icon Display / Trigger Button */}
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-outline flex-1 justify-start gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {value ? (
            <>
              <span className="text-2xl">{value}</span>
              <span className="text-sm opacity-70">Click to change</span>
            </>
          ) : (
            <span className="text-sm opacity-70">{placeholder}</span>
          )}
        </button>
        
        {value && (
          <button
            type="button"
            className="btn btn-outline btn-error"
            onClick={handleClearIcon}
            title="Clear icon"
          >
            ✕
          </button>
        )}
      </div>

      {/* Icon Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full md:w-[600px] bg-base-100 border border-base-300 rounded-lg shadow-xl p-4">
          {/* Search Bar */}
          <div className="form-control mb-3">
            <input
              type="text"
              placeholder="Search icons..."
              className="input input-bordered input-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Recent Icons */}
          {!searchTerm && recentIcons.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold mb-2 opacity-60">Recently Used</h4>
              <div className="grid grid-cols-8 gap-2">
                {recentIcons.map((icon, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`btn btn-sm btn-square ${value === icon ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => handleSelectIcon(icon)}
                    title={icon}
                  >
                    <span className="text-xl">{icon}</span>
                  </button>
                ))}
              </div>
              <div className="divider my-3"></div>
            </div>
          )}

          {/* Category Tabs */}
          {!searchTerm && (
            <div className="tabs tabs-boxed mb-3 overflow-x-auto flex-nowrap">
              {Object.keys(ICON_GROUPS).map((group) => (
                <a
                  key={group}
                  className={`tab tab-sm whitespace-nowrap ${selectedGroup === group ? 'tab-active' : ''}`}
                  onClick={() => setSelectedGroup(group)}
                >
                  {group}
                </a>
              ))}
            </div>
          )}

          {/* Icon Grid */}
          <div className="max-h-[300px] overflow-y-auto">
            {searchTerm && (
              <h4 className="text-xs font-semibold mb-2 opacity-60">
                Search Results ({filteredIcons.length})
              </h4>
            )}
            
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-8 gap-2">
                {filteredIcons.map((icon, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`btn btn-sm btn-square ${value === icon ? 'btn-primary' : 'btn-ghost'} hover:btn-primary`}
                    onClick={() => handleSelectIcon(icon)}
                    title={icon}
                  >
                    <span className="text-xl">{icon}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm opacity-60">
                No icons found
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-base-300">
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close picker */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
};

export default IconPicker;
