import React from "react";
import { Search } from "../search/Search";

type Props = {};

const Navbar = (props: Props) => {
  return (
    <div className="bg-linear-to-b from-black to-transparent">
      <div>
        <span className="font-bold">KINO</span>
        <span> </span>
        <span className="text-red">XII</span>
      </div>
      <div>
        <Search placeholder="testss" />
      </div>
    </div>
  );
};

export default Navbar;
