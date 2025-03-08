import React from "react"
import Providers from "~resources/ui/providers"
import "~resources/ui/style.css"
import AppRoutes from "~resources/ui/routes"

const Spa = () => {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
};

export default Spa