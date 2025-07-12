import React from 'react';
import "../../styles/Home.css";
import Banner from './Banner';
import Main from './Main';

const Home = () => {
    return (
        <>
            <div className='home-container'>
                <Banner />
                <Main/>
                
            </div>
            
        </>
    );
};

export default Home;
