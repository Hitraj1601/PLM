export default function StageProgressBar({ stages, currentStageId, ecoStatus }) {
  if (!stages || stages.length === 0) return null;

  const sorted = [...stages].sort((a, b) => a.order_index - b.order_index);
  const currentIndex = sorted.findIndex((s) => s.id === currentStageId);

  return (
    <div className="flex items-center w-full py-4">
      {sorted.map((stage, i) => {
        const isCompleted = i < currentIndex || ecoStatus === 'applied';
        const isCurrent = i === currentIndex && ecoStatus !== 'applied';
        const isFuture = i > currentIndex && ecoStatus !== 'applied';

        return (
          <div key={stage.id} className="flex items-center flex-1 last:flex-none">
            {/* Circle + Label */}
            <div className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isCompleted
                    ? 'bg-sienna-600 border-sienna-500 text-white'
                    : isCurrent
                    ? 'bg-sienna-600/30 border-sienna-500 text-sienna-300 animate-pulse'
                    : 'bg-navy-700 border-navy-500 text-gainsboro-500'
                }`}
              >
                {isCompleted ? '✓' : i + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium whitespace-nowrap ${
                  isCompleted
                    ? 'text-sienna-400'
                    : isCurrent
                    ? 'text-sienna-300'
                    : 'text-gainsboro-500'
                }`}
              >
                {stage.name}
              </span>
              {stage.requires_approval && (
                <span className="text-[10px] text-amber-400 mt-0.5">Approval</span>
              )}
            </div>

            {/* Connecting line */}
            {i < sorted.length - 1 && (
              <div className="flex-1 mx-2 mt-[-24px]">
                <div
                  className={`h-0.5 w-full transition-all ${
                    i < currentIndex || ecoStatus === 'applied'
                      ? 'bg-sienna-500'
                      : 'bg-navy-600'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
