import React from 'react';
import ReactCompareImage from 'react-compare-image';

/**
 * BeforeAfterSlider Component
 * Interactive before/after photo comparison slider
 * Allows customers to see repair quality with a draggable slider
 */
const BeforeAfterSlider = ({ beforeImage, afterImage, alt = 'Vehicle repair comparison' }) => {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg">
      <ReactCompareImage
        leftImage={beforeImage}
        rightImage={afterImage}
        leftImageAlt={`Before repair - ${alt}`}
        rightImageAlt={`After repair - ${alt}`}
        sliderLineWidth={3}
        sliderLineColor="#e53935"
        handleSize={40}
        hover={true}
      />
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 text-sm text-gray-700">
        <span className="font-medium">← Before</span>
        <span className="text-gray-500">Drag slider to compare</span>
        <span className="font-medium">After →</span>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
