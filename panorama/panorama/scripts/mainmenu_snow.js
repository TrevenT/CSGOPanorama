                                                                                      

"use strict";

var MainMenuSnow = ( function ()
{
    var m_snowLoopScheduleHandler = null;
    var m_canvas = null;
    var numFlakes = 500,
        m_canvasWidth = 0,
        m_canvasHeight = 0;
    var aFlakes = [];
    
                                                    
    function Flake ( x, y ) 
    {
        var minRadius = 2,
            maxRadius = 3,
            maxSpeed = 0.75;
        
        this.x = x;
        this.y = y;
        this.a = randomBetweenRange( 0, Math.PI );
        this.aStep = 0.01;

        this.radius = randomBetweenRange( minRadius, maxRadius, false );
        this.alpha = 0.2 + ( 0.5 * ( (this.radius - minRadius) / (maxRadius - minRadius) ) );
        this.speed = (this.radius / maxRadius) * maxSpeed;
        
        this.update = function()
        {
            this.x += Math.cos( this.a ) * 0.5;                                             
            this.a += this.aStep;
            this.y += this.speed;
        };
    }

    var CancelSnowLoop = function ()
    {
                                                                                                     
        if ( m_snowLoopScheduleHandler )
        {
            $.UnregisterForUnhandledEvent( "CSGOFrameUpdate", m_snowLoopScheduleHandler );
            m_snowLoopScheduleHandler = null;

            m_canvas.ClearJS( '#00000000' );
        }
    };
    
    function _Init( elCanvas )
    {
        m_canvas = elCanvas;
        m_canvasWidth = 1920;
        m_canvasHeight = 1080;

                                          
                                               
                                                
        
        CancelSnowLoop();

        m_snowLoopScheduleHandler = $.RegisterForUnhandledEvent( "CSGOFrameUpdate", UpdateCanvas );
        
        var i = numFlakes,
            oflake,
            x,
            y;

        while ( i-- )
        {
            x = randomBetweenRange( 5, m_canvasWidth, true );
            y = randomBetweenRange( 5, m_canvasHeight, true );

            oflake = new Flake(x, y);
            aFlakes.push( oflake );
        }
    }
    
    function UpdateCanvas()
    {
        var i = aFlakes.length,
            flakeA;
        
            m_canvas.ClearJS( '#00000000' );

        while ( i-- )
        {
            flakeA = aFlakes[ i ];
            flakeA.update();
            m_canvas.DrawFilledCircleJS( flakeA.x, flakeA.y, flakeA.radius, 'rgba(255, 255, 255, ' + flakeA.alpha + ')' );

            if ( flakeA.y >= m_canvasHeight )
            {
                                                         
                flakeA.y = -flakeA.radius;
            }
        }
    }
    
    function randomBetweenRange( min, max, shouldRound )
    {
        var num = Math.random() * (max - min + 1) + min;

        if ( shouldRound )
        {
            return Math.floor(num);
        }
        else
        {
            return num;
        }
    }

    return {
        Init: _Init
    };
} )();