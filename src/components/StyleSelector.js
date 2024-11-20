import PropTypes from 'prop-types';

export function StyleSelector({ onStyleSelect }) {
  const styles = ['formal', 'funny', 'flirty', 'outrageous'];
  
  return (
    <>
      <h1>You have but one chance, Ellie</h1>
      <h2>Choose your preferred style:</h2>
      <div className="style-buttons">
        {styles.map(style => (
          <button key={style} onClick={() => onStyleSelect(style)}>
            {style}
          </button>
        ))}
      </div>
    </>
  );
}

StyleSelector.propTypes = {
  onStyleSelect: PropTypes.func.isRequired,
}; 