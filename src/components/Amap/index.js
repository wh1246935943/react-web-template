import React, { memo, useEffect, useState, useRef } from 'react';
import { Amap, Marker, useAmap, InfoWindow } from '@amap/amap-react';
import MARKER_PNG from './assets/point.png';
import MARKER_SELECTED_PNG from './assets/point_selected.png';

import './index.less';

const AMap = (props) => {
  let [center, setCenter] = useState([109.271817, 34.38259]);
  let [zoom, setZoom] = useState(14);
  let [curMarkerId, setCurMarkerId] = useState('');
  let [infoPosition, setInfoPositipn] = useState(null);
  let [markerNameShowId, setMarkerNameShowId] = useState(false);

  let {
    aZoom = '',
    onMarkClick = () => {},
    onRightClickMap = () => {},
    markers = [],
    curMapCenter = [],
    centerItem = null,
    showCenterItemIcon = false,
    markerSelectIds = [],
  } = props;

  useEffect(() => {
    if (curMapCenter?.length) {
      setCenter([curMapCenter[0], curMapCenter[1]]);
      setZoom(17);
    }
  }, [curMapCenter]);

  useEffect(() => {
    if (centerItem?.id) {
      setCurMarkerId(centerItem.id);
    }
  }, [centerItem]);

  useEffect(() => {
    if (markerSelectIds.length) {
      setMarkerNameShowId(markerSelectIds[0]);
    }
  }, [markerSelectIds]);

  const mouseOverMarker = (e, markerItm) => {
    setMarkerNameShowId(markerItm.id);
  };

  const mouseOutMarker = (e, markerItm) => {
    if (centerItem?.id) {
      setMarkerNameShowId(centerItem.id);
    }
  };

  const clickMarker = (e, markerItm) => {
    onMarkClick({
      longitude: markerItm?.longitude,
      latitude: markerItm?.latitude,
      extData: markerItm ?? {},
    });
  };

  const rightMapClick = (longitude, latitude) => {
    setInfoPositipn([longitude, latitude]);
  };

  const addPoint = (pointPosition) => {
    onRightClickMap({
      lat: pointPosition[1],
      lng: pointPosition[0],
    });
    setInfoPositipn(null);
  };

  return (
    <div className="amap">
      <Amap
        viewMode="3D"
        zoom={aZoom ? aZoom : zoom}
        center={center}
        animateEnable={false}
        onRightClick={(map, e) => {
          if (e && e.lnglat) {
            rightMapClick(e.lnglat.lng, e.lnglat.lat);
          }
        }}
      >
        {markers &&
          markers.length > 0 &&
          markers.map((markerItm, markerIdx) => (
            <Marker
              key={markerItm?.id}
              position={[markerItm.longitude, markerItm.latitude]}
              className="marker-info"
              onClick={(e) => clickMarker(e, markerItm)}
              onMouseOver={(e) => mouseOverMarker(e, markerItm)}
              onMouseOut={(e) => mouseOutMarker(e, markerItm)}
            >
              <div
                style={{
                  visibility:
                    markerNameShowId === markerItm?.id ? 'visible' : 'hidden',
                }}
                className="custom-marker"
              >
                {markerItm.name}
              </div>
              <img
                src={
                  curMarkerId === markerItm?.id && showCenterItemIcon
                    ? MARKER_SELECTED_PNG
                    : MARKER_PNG
                }
                alt="marker"
              />
            </Marker>
          ))}
        {infoPosition && infoPosition.length && (
          <InfoWindow position={infoPosition} isCustom>
            <div className="addPoint" onClick={() => addPoint(infoPosition)}>
              新增点位
            </div>
          </InfoWindow>
        )}
      </Amap>
    </div>
  );
};

export default AMap;
