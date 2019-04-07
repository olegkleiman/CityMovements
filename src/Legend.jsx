import React from 'react';

const defaultContainer =  ({children}) => <div className="legend">{children}</div>;

const Legend = (props) => {

    const Container = props.containerComponent || defaultContainer;

    return (<div className='shadow bottom-right bg-white push-tiny--right push-small--bottom soft-tiny'>
              <div className='legend-container small'>
                <div>
                  <label className='label push-tiny--right'>Travel Times (mins)</label>
                  <div className='legend-scale-color-group'>
                    <div className='legend-scale-color legend-color-1'></div>
                    <div className='legend-scale-color legend-color-2'></div>
                    <div className='legend-scale-color legend-color-3'></div>
                    <div className='legend-scale-color legend-color-4'></div>
                    <div className='legend-scale-color legend-color-5'></div>
                    <div className='legend-scale-color legend-color-6'></div>
                    <div className='legend-scale-color legend-color-7'></div>
                    <div className='legend-scale-color legend-color-8'></div>
                    <div className='legend-scale-color legend-color-9'></div>
                    <div className='legend-scale-color legend-color-10'></div>
                    <div className='legend-scale-color legend-color-11'></div>
                  </div>
                  <div className='legend-scale-color-group'>
                    <div className='legend-scale-label' style={{ width: '27.272727272727273px' }}>0</div>
                    <div className='legend-scale-label' style={{ width: '27.272727272727273px' }}>5</div>
                    <div className="legend-scale-label" style={{ width: '27.272727272727273px' }}>10</div>
                    <div className="legend-scale-label" style={{ width: '27.272727272727273px' }}>15</div>
                    <div className="legend-scale-label" style={{ width: '27.272727272727273px' }}>20</div>
                    <div className="legend-scale-label" style={{ width: '27.272727272727273px' }}>25</div>
                    <div className="legend-scale-label" style={{ width: '27.272727272727273px' }}>30</div>
                    <div className="legend-scale-label" style={{ width: '27.272727272727273px' }}>35</div>
                    <div className="legend-scale-label" style={{ width: '27.272727272727273px' }}>40</div>
                    <div className="legend-scale-label" style={{ width: '27.272727272727273px' }}>50</div>
                    <div className="legend-scale-label" style={{ width: '27.272727272727273px' }}>60</div>
                  </div>
                </div>
              </div>
            </div>)
}

export default Legend;
