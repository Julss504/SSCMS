const Logo = ({ className = "h-9 w-9", showText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 ${!showText ? 'justify-center' : ''}`}>
      <div className={`${className} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <img src="./src/assets/logo2.png" alt="SSC" className="object-contain h-full w-full" />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <h1 className="text-sm font-bold text-white tracking-tight">SSC Portal</h1>
          <p className="text-[10px] text-brand-400 font-medium">ACLC College Ormoc</p>
        </div>
      )}
    </div>
  );
};

export default Logo;
