const PageBackground = () => {
  return (
    <>
      {/* Colorful Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-accent-orange/10 via-primary/5 to-success/10 -z-10" />
      <div className="fixed top-20 left-10 w-72 h-72 bg-accent-orange/20 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse -z-10" style={{ animationDelay: "1s" }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/10 rounded-full blur-3xl -z-10" />
    </>
  );
};

export default PageBackground;
