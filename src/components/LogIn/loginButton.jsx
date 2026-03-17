import React from 'react';
import './loginButton.css';

const LoginButton = ({ texto }) => {
    return (
        <button
            type="submit"
            className="btn w-100 text-white mb-4 animated-btn"
            style={{ backgroundColor: '#4285F4', padding: '0.6rem', borderRadius: '6px' }}
        >
            {texto}
        </button>
    );
};

export default LoginButton;