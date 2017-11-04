import { PropTypes } from 'react'

export const l20nShape = PropTypes.shape({
  update: PropTypes.func.isRequired,
  hasReady: PropTypes.func.isRequired,
  get: PropTypes.func.isRequired,
  getAsync: PropTypes.func.isRequired,
  parse: PropTypes.func.isRequired,
  getNS: PropTypes.func.isRequired,
  getNSAsync: PropTypes.func.isRequired
});
