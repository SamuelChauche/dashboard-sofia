import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';
import './styles/Navbar.css';

function Navbar() {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();

  const walletAddress = user?.wallet?.address;

  const displayAddress = walletAddress
    ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
    : '';

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__left">
          <img className="navbar__logo" src="/logo.png" alt="Sofia" />
          <span className="navbar__title">Sofia — Beta Season</span>
        </div>
        <div className="navbar__right">
          {ready && !authenticated && (
            <button className="navbar__connect-btn" onClick={() => login()}>
              Connect Wallet
            </button>
          )}
          {ready && authenticated && walletAddress && (
            <div className="navbar__wallet">
              <span className="navbar__address">{displayAddress}</span>
              <button className="navbar__disconnect-btn" onClick={() => logout()}>
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
