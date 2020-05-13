'use strict';


var EndOfMatch = ( function () {

	var _m_cP = $( "#EndOfMatch" );

	var eomPanel_t = (function ( elPanel, id ) {

		var _m_elPanel = elPanel;
		var _m_id = id;

		return {
			
			m_elPanel		: _m_elPanel,
			m_id			: _m_id
		};
	});


	var _m_arrPanelObjects = [];
	var _m_currentPanelIndex;
	var _m_jobStart;
	var _m_elActiveTab;


	function _NavigateToTab( tab )
	{
		                                          

		if ( _m_elActiveTab )
		{
			_m_elActiveTab.RemoveClass( 'Active' );
		}
	
		_m_elActiveTab = _m_cP.FindChildTraverse( tab );
	
		if( _m_elActiveTab )
		{
			_m_elActiveTab.AddClass( 'Active' );
		}
		
	}

	function _SwitchToPanel( tab )
	{

		_m_cP.FindChildTraverse( 'rb--' + tab ).RemoveClass("hidden");
		_m_cP.FindChildTraverse( 'rb--' + tab ).checked = true;
		_NavigateToTab( tab );
	}

	function _RegisterPanelObject ( panel, id )
	{
		_m_arrPanelObjects.push( panel );
	}


	function _Initialize() {

		if ( _m_arrPanelObjects )
			_m_arrPanelObjects.length = 0;
			
		_m_currentPanelIndex = -1;
		_m_jobStart = undefined;
		_m_elActiveTab = "";

		if ( _m_jobStart )
		{
			$.CancelScheduled( _m_jobStart );
			_m_jobStart = undefined;
		}

		_m_cP.RemoveAndDeleteChildren();

		_m_cP.BLoadLayoutSnippet("snippet_eom-root", true, false);
		_m_cP.FindChildTraverse( "id-eom-layout" ).BLoadLayoutSnippet("snippet-eom-layout--default", true, false);
			
		var elNavBar = _m_cP.FindChildTraverse( "id-content-navbar__tabs" );
		_m_cP.FindChildrenWithClassTraverse( "timer" ).forEach( el => el.active = false );

		_m_cP.FindChildrenWithClassTraverse("eom-panel").forEach( function ( elPanel ) {
	
				                           
				var elRBtn = $.CreatePanel( "RadioButton", elNavBar, "rb--" + elPanel.id );
				elRBtn.BLoadLayoutSnippet( "snippet_navbar-button" );
				elRBtn.AddClass( "navbar-button");
				elRBtn.AddClass( "appear");

				var _SetOnActivateEvent = function ( tab )
				{
					_NavigateToTab( tab );
				}

				elRBtn.SetPanelEvent( 'onactivate', _SetOnActivateEvent.bind( undefined, elPanel.id ) );

				elRBtn.FindChildTraverse( "id-navbar-button__label" ).text = $.Localize( elPanel.id );


				                   
				var panelXML = "file://{resources}/layout/" + elPanel.GetAttributeString("data-xml", "");
				elPanel.RemoveAndDeleteChildren();
				elPanel.BLoadLayout( panelXML, true, false);
	
		} );
		
		             
		var elBlur = _m_cP.GetParent().FindChildTraverse( "HudBlur" );
		elBlur.RemoveClass( "eom-blur-fade-in" );

		_m_cP.RemoveClass( "reveal" );
	}


	function _Start () 
	{

		_Initialize();
	
		_m_jobStart = $.Schedule( 3.0, _ =>
		{
			                   
			var elBlur = _m_cP.GetParent().FindChildTraverse( "HudBlur" );
			elBlur.AddClass( "eom-blur-fade-in" );

			                                                                                  
			$.DispatchEvent( 'Scoreboard_OnEndOfMatch' );
	
			_m_cP.AddClass( "reveal" );

			_m_cP.SetMouseCapture( true );
			_m_cP.LatchPlayerData();

			$.Schedule( 1.25, _ShowNextPanel );

			_m_jobStart = undefined;

		})
	}

	function _StartDisplayTimer ( time )
	{
		var elProgBar = _m_cP.FindChildTraverse( "id-display-timer-progress-bar" );

		        

		$.Schedule( 0.0, function()
		{
			elProgBar.style.transitionDuration = "0s";
			
			elProgBar.style.width = '0%';
		} );

		       

		
		$.Schedule( 0.0, function()
		{
			elProgBar.style.transitionDuration = time + "s";

			elProgBar.style.width = '100%';
		} );

	}


	                                                                   

	var _ShowNextPanel = function () {
	
		_m_currentPanelIndex++;


		if ( _m_currentPanelIndex < _m_arrPanelObjects.length )
		{		
			                                          
			if ( _m_currentPanelIndex === ( _m_arrPanelObjects.length - 1 ) &&
				!GameStateAPI.IsDemoOrHltv() &&
				!GameStateAPI.IsQueuedMatchmaking() )
			{
				_m_cP.FindChildrenWithClassTraverse( "timer" ).forEach( el => el.active = true );
			}	
			
			_m_arrPanelObjects[ _m_currentPanelIndex ].Start();
		}
	}

	function _Shutdown ()
	{
		for ( var i in _m_arrPanelObjects )
		{
			if ( _m_arrPanelObjects[ i ].Shutdown )
				_m_arrPanelObjects[ i ].Shutdown();
		}	
	}


	                      
	return {

		Initialize			: _Initialize,
		Start				: _Start,
		ShowNextPanel		: _ShowNextPanel,
		SwitchToPanel		: _SwitchToPanel,
		RegisterPanelObject	: _RegisterPanelObject,
		Shutdown			: _Shutdown,
		StartDisplayTimer	: _StartDisplayTimer,
		
	};

})();


                                                                                                    
                                           
                                                                                                    
(function () {

	$.RegisterForUnhandledEvent( "EndOfMatch_Show", EndOfMatch.Start ); 
	$.RegisterForUnhandledEvent( "EndOfMatch_Shutdown", EndOfMatch.Shutdown );

	$.RegisterForUnhandledEvent( "EndOfMatch_ShowNext", EndOfMatch.ShowNextPanel );
	



})();
