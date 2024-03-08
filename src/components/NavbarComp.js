import { bsc } from "@wagmi/chains";
import { useWeb3Modal } from "@web3modal/react";
import { Button, Navbar, NavbarBrand } from "reactstrap";
import { useAccount } from "wagmi";

export default function NavbarComp() {
  const { open, setDefaultChain } = useWeb3Modal();

  const connect = async () => {
    await open();
    setDefaultChain(bsc);
  };

  const { address } = useAccount();

  return (
    <Navbar id="navbar" className="custom-navbar">
      <NavbarBrand>
        <div className="navbar">
          <div className="logosection">
          
         
          </div>
        <h1 className="headNav">APADA STAKING</h1>
        </div>
      </NavbarBrand>
      <Button color="primary" className="nav-button" onClick={connect}>
        {!address ? "Connect" : address?.replace(address?.slice(6, 38), "...")}
      </Button>
    </Navbar>
  );
}
