import PropTypes from 'prop-types';

const Headers=({onDraw})=>{
    return (
        <div>

        
        <nav>
        <button onClick={()=>onDraw("Circle")}>Circle</button>
        <button onClick={()=>onDraw("Rectange")}>Rectangle</button>
        <button onClick={()=>onDraw("Square")}>Square</button>
        </nav>
        </div>
    )
}
Headers.propTypes = {
    onDraw: PropTypes.func.isRequired,
  };
export default Headers;