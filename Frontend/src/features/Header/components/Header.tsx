import daveLogo from '/logo-dave-text.png?url'
import '../styles/Header.css';

const Header = () => { 
    return (
        <>
            <header>
                <img src={daveLogo} alt="Dodgy Dave's Stock Predictions"/>
            </header>
        </>
    );
}

export default Header;
