import React, { useEffect, useRef, useState } from 'react'
import { isInside } from '../helpers/isInside';

export default function Home() {
    const [myFile, setMyfile] = useState();
    const [imageUploaded, setImageUploaded] = useState();
    const [points, setPoints] = useState([])
    const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
    const [showing, setShowing] = useState('')
    console.log('dimensions', dimensions, myFile);
    const [polygon, setPolygon] = useState([])
    const [scale, setScale] = useState(1)
    const [originalPoints, setOriginalPoints] = useState([])
    const [cropPoints, setCropPoints] = useState();
    const [loader, setLoader] = useState(false)
    const svgRef = useRef();
    const myCanvas = useRef();
    const imageRef = useRef()
    const handlePicture = (e) => {

        setMyfile(URL.createObjectURL(e.target.files[0]));
        setShowing("image")
        setPoints([]);

    }

    console.log('loader',loader);

    const clickPoint = (e) => {
        console.log('clickPoint', e);
        let _points = [...points];
        let point = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        _points.push(point);
        setPoints(_points);

    }

    const savingCrop = async () => {
        if(points.length > 0){
          await  setLoader(true);

          setTimeout(() => {
            saveCrop()
          }, 1000);
        }
    }




    const saveCrop = () => {

        setLoader(true)

        let _points = [...points];
        let _originalCrop = _points.map((item) => {
            return { x: item.x, y: item.y }
        })
        setPolygon(_originalCrop)
        setOriginalPoints(_originalCrop);
        let cropPoints = [];
        for (let i = 0; i < dimensions.width; i++) {
            for (let z = 0; z < dimensions.height; z++) {
                let point = { x: i, y: z };
                if (isInside(_originalCrop, _originalCrop.length, point)) {
                    cropPoints.push(point);
                }
            }
        }
        setCropPoints(cropPoints);
        setShowing('result')
    
      }

    useEffect(() => {
        if (showing === 'result') {


            if (polygon) {

                let img = new Image();
                img.onload = () => {


                    let image = img;
                    let width = image.width * scale;
                    let height = image.height * scale;
                    let canvas = document.getElementById('canvas');
                    if (canvas.getContext) {
                        let canvasCtx = canvas.getContext('2d');
                        canvasCtx.drawImage(image, 0, 0, width, height)
                        var actualImageData = canvasCtx.getImageData(0, 0, width, height);
                        for (var y = 0; y < height; y++) {
                            for (var x = 0; x < width; x++) {
                                var point = { x: x, y: y };
                                if (!isInside(polygon, polygon.length, point)) {
                                    actualImageData.data[(y * width + x) * 4 + 3] = 0;
                                }


                            }
                        }

                        canvasCtx.putImageData(actualImageData, 0, 0);
                        setLoader(false);





                    }
                    else {
                        console.log('noContext');
                    }
                    // let canvasCtx = canvasChunk.getContext("2d");
                    // canvasCtx.drawImage(image,  dx, dy, dWidth, dHeight)

                }
                img.src = myFile

            }
            else {
                setLoader(false)
            }
        }

    }, [polygon, showing])

    console.log('dimensions', myFile);



    useEffect(() => {
        if (showing === 'crop') {

            if (myFile !== undefined) {
                const img = new Image();
                img.onload = () => {
                    setDimensions({ width: img.width, height: img.height });
                    let divDimesion = document.getElementById('canvasSvg').offsetWidth;
                    console.log('divDimesion', divDimesion);
                    let _scale = divDimesion / img.width;
                    setScale(_scale);
                }
                img.src = myFile

            }
        }


    }, [showing])
    return (
        <div className='container'>
            <div className='p-5 text-center'>
                <input type={'file'} onChange={(e) => handlePicture(e)} />
            </div>
            {loader && <div className='disableUI'  style={{ paddingTop: "250px" }}>
                <h3 style={{ textAlign: "center", color: "white" }}>Generating Crop...</h3>
            </div>}
           
            {showing === "image" &&
                <>
                    <div style={{ width: '100%', height: '100%' }}>
                        <img
                            src={myFile}
                            width={"100%"}
                            height={"100%"}
                        />
                    </div>
                    <div className='text-end'>
                        <button onClick={() => setShowing('crop')}>Crop</button>
                    </div>
                </>
            }
            {showing === 'crop' &&
                <>
                    <div className='text-center'>
                        <div ref={svgRef} id='canvasSvg' style={{ width: '100%', overflow: 'hidden' }}>
                            {dimensions !== undefined && dimensions && "width" in dimensions && "height" in dimensions &&
                                <div style={{ width: dimensions.width * scale, height: dimensions.height * scale }}>
                                    <svg width={dimensions.width * scale} height={dimensions.height * scale}
                                        onClick={(e) => clickPoint(e)}
                                        style={{ position: "absolute", zIndex: 2 }}

                                    >
                                        {points.length > 0 &&


                                            points.map((item, index) => {
                                                if (index === 0) {
                                                    return (
                                                        <circle cx={item.x} cy={item.y} r="4" stroke="red" stroke-width="1" fill="red" />
                                                    )
                                                }
                                                else {
                                                    return (
                                                        <line x1={points[index - 1].x} x2={points[index].x} y1={points[index - 1].y} y2={points[index].y} stroke="red" strokeWidth="2" key={"line_" + index} ></line>
                                                    )
                                                }
                                                //  else return(
                                                //     <line x1={item.x} y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />

                                                //     )


                                            })
                                        }
                                    </svg>

                                    <img
                                        src={myFile}
                                        width={dimensions.width * scale}
                                        height={dimensions.height * scale}
                                        id='image'
                                        ref={imageRef}


                                    ></img>

                                </div>

                            }
                            {/* <img src={myFile} /> */}

                        </div>

                    </div>

                    <div className='text-end'>
                        <button onClick={() => setPoints([])}>Reset </button>
                        <button onClick={() =>   savingCrop() }>Save</button>
                    </div>
                </>
            }

            {/* {dimensions !== undefined && dimensions && dimensions.width > 0 && dimensions.height > 0 &&
                <canvas id='canvasOriginal' ref={myCanvas} width={dimensions.width} height={dimensions.height}>

                </canvas>} */}


            {showing === "result" && dimensions !== undefined && dimensions && dimensions.width > 0 && dimensions.height > 0 &&
                <>
                    <canvas id='canvas' ref={myCanvas} width={dimensions.width * scale} height={dimensions.height * scale} style={{ border: 'black', border: '2px' }}>

                    </canvas>

                    <div className='text-end'>
                        <button onClick={() => setShowing('crop')}>Back</button>
                        <button onClick={() => setShowing('image')}>Try More</button>
                    </div>


                </>}


        </div>
    )
}
