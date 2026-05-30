const Logo = ({ className = "h-12 w-12" }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`${className} rounded-lg flex items-center justify-center`}>
        <img src="./src/assets/logo2.png" alt="ssc" />
      </div>
      <div className={`${className} rounded-lg flex items-center justify-center`}>
        <img src="./src/assets/logo1.png" alt="aclc" />
      </div>
      {/* <div className="flex flex-col">
         <h1 className="text-xl font-bold text-ssc-red-600 leading-tight">SSC</h1>
         <p className="text-sm text-gray-700 font-medium">ACLC College Ormoc</p>
      </div> */}
    </div>
  );
};

export default Logo;
