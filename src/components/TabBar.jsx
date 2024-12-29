import React, { useState, useRef, useEffect } from "react";

const TabBar = ({ groups, selectedGroup, onSelectGroup }) => {
  const containerRef = useRef(null); // Ref for the entire tab bar container
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check if scrolling is possible
  const checkOverflow = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  // Scroll to the left or right
  const scroll = (direction) => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      const newScrollPosition =
        direction === "left"
          ? Math.max(0, scrollLeft - clientWidth / 2)
          : Math.min(
              containerRef.current.scrollWidth - clientWidth,
              scrollLeft + clientWidth / 2
            );

      containerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  // Run overflow check on load and resize
  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [groups]);

  return (
    <div className="relative border-t-2 border-gray-400">
      {/* Scrollable Tab Container */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto space-x-4 bg-gray-200 p-2 rounded-b-lg shadow-md no-scrollbar text-nowrap"
        onScroll={checkOverflow}
      >
        {Array.isArray(groups) && groups.length > 0 ? (
          groups.map((group) => (
            <button
              key={group.groupID}
              onClick={() => onSelectGroup(group)}
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  selectedGroup?.groupID === group.groupID
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {group.groupName}
            </button>
          ))
        ) : (
            <p className="text-gray-500 px-4">No groups available</p>
        )}
      </div>

      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 sm:top-1/3 transform -translate-y-1/2 bg-gray-300 hover:bg-gray-400 text-gray-700 p-2 rounded-full z-10"
        >
          &lt;
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 sm:top-1/3 transform -translate-y-1/2 bg-gray-300 hover:bg-gray-400 text-gray-700 p-2 rounded-full z-10"
        >
          &gt;
        </button>
      )}
    </div>
  );
};

export default TabBar;