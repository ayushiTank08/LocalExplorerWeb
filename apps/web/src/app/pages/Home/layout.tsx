import React from 'react';

const HomeLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div className="pb-0">{children}</div>
    </>
  );
};

export default HomeLayout;
