import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../../stores/workflow';

interface DelayConfigProps {
  nodeId: string;
  data?: Record<string, any>;
}

type TimeUnit = 'ms' | 's' | 'm' | 'h';

const DelayConfig: React.FC<DelayConfigProps> = ({ nodeId, data }) => {
  const { updateNodeData } = useWorkflowStore();
  const [duration, setDuration] = useState<string>(data?.duration?.toString() || '');
  const [unit, setUnit] = useState<TimeUnit>(data?.unit || 's');

  // Reset local state when nodeId changes (switching between different nodes)
  useEffect(() => {
    setDuration(data?.duration?.toString() || '');
    setUnit(data?.unit || 's');
  }, [nodeId]); // Only reset when nodeId changes

  // Update store when local state changes
  useEffect(() => {
    if (duration) {
      const durationValue = parseInt(duration, 10);
      if (!isNaN(durationValue) && durationValue > 0) {
        updateNodeData(nodeId, { duration: durationValue, unit });
      }
    }
  }, [duration, unit, nodeId, updateNodeData]);

  const convertToMilliseconds = () => {
    const durationValue = parseInt(duration, 10);
    if (isNaN(durationValue)) return 0;

    switch (unit) {
      case 'ms':
        return durationValue;
      case 's':
        return durationValue * 1000;
      case 'm':
        return durationValue * 60 * 1000;
      case 'h':
        return durationValue * 60 * 60 * 1000;
      default:
        return durationValue;
    }
  };

  return (
    <div className="space-y-4">
      {/* Duration Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Delay Duration
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter duration..."
            min="1"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as TimeUnit)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ms">Milliseconds</option>
            <option value="s">Seconds</option>
            <option value="m">Minutes</option>
            <option value="h">Hours</option>
          </select>
        </div>
      </div>

      {/* Preview */}
      {duration && (
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-xs text-gray-700">
            <span className="font-medium">Total delay:</span>
            <span className="ml-2">{convertToMilliseconds().toLocaleString()} ms</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DelayConfig;
