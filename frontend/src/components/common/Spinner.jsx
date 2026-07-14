const Spinner = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-[3px]' };

  const spinner = (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-brand-500 border-t-transparent`}
      role="status"
      aria-label="Loading"
    />
  );

  if (!fullScreen) return spinner;

  return <div className="flex min-h-screen items-center justify-center">{spinner}</div>;
};

export default Spinner;
