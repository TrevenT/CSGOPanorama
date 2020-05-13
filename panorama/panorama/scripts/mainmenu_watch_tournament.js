'use strict';

var mainmenu_watch_tournament = (function () {

	var _m_activeTab;
	var _m_initalizeHandler;
	var _m_matchesTab;

	var _NavigateToTab = function( tab, tournament_id, oData = null )
	{
		if ( tab !== 'JsTournamentMatches' )
		{
			var restrictions = LicenseUtil.GetCurrentLicenseRestrictions();
			if ( restrictions !== false )
			{
				LicenseUtil.ShowLicenseRestrictions( restrictions );
				if ( _m_matchesTab )
				{
					_m_matchesTab.checked = true;
				}
				_NavigateToTab( "JsTournamentMatches", tournament_id );
				return false;
			}
		}

		                                                                 
		var pressedTab = $.FindChildInContext( '#' + tab );
		if ( !pressedTab && oData )
		{
			                                                               
			                                                                   
			                                                                                            

			pressedTab = $.CreatePanel( 'Panel', $.FindChildInContext( '#JsTournamentContainer' ), tab );
			                                                      

			pressedTab.BLoadLayout('file://{resources}/layout/tournaments/pickem_' + oData.xmltype + '.xml', false, false );
			pressedTab.RegisterForReadyEvents( true );
			pressedTab.SetReadyForDisplay( false );

			pressedTab._oData = oData;
			PickemCommon.Init( pressedTab );

			_AddEventHandlers( pressedTab );
		}

		if ( _m_activeTab !== pressedTab )
		{
			if ( _m_activeTab )
			{
				_m_activeTab.AddClass( 'tournament-content-container--hidden' );
			}

			_m_activeTab = pressedTab;
			_m_activeTab.RemoveClass( 'tournament-content-container--hidden' );

			_m_activeTab.visible = true;
			_m_activeTab.SetReadyForDisplay( true );
		}

		if ( _m_activeTab.id === "JsTournamentMatches" )
		{
			_RefreshMatchesTab(tournament_id );
		}
	};

	var _RefreshMatchesTab = function( tournament_id )
	{
		matchList.UpdateMatchList( _m_activeTab, tournament_id );
		if ( _m_activeTab.activeMatchInfoPanel )
		{
			matchInfo.ResizeRoundStatBars( _m_activeTab.activeMatchInfoPanel );
		}
	};

	var _RefreshActivePage = function( tournament_id )
	{
		if ( _m_activeTab.id === "JsTournamentMatches" )
		{
			_RefreshMatchesTab( tournament_id );
			return;
		}
		
		PickemCommon.RefreshData( _m_activeTab );
	}

	var _AddEventHandlers = function( elPanel )
	{
		$.RegisterEventHandler( 'ReadyForDisplay', elPanel, PickemCommon.ReadyForDisplay.bind( undefined, elPanel )  );
		$.RegisterEventHandler( 'UnreadyForDisplay', elPanel, PickemCommon.UnreadyForDisplay.bind( undefined, elPanel )  );

		                                                                          
		                                                       
		elPanel.OnPropertyTransitionEndEvent = function ( panelName, propertyName )
		{
			if( elPanel.id === panelName && propertyName === 'opacity' )
			{
				                                         
				if( elPanel.visible === true && elPanel.BIsTransparent() )
				{
					                                               
					elPanel.visible = false;
					elPanel.SetReadyForDisplay( false );
					return true;
				}
			}

			return false;
		};

		$.RegisterEventHandler( 'PropertyTransitionEnd', elPanel, elPanel.OnPropertyTransitionEndEvent );
	};

	function _UpdateMatchList( listId )
	{
		if ( _m_activeTab && ( _m_activeTab.tournament_id === listId ) )
		{
			_RefreshActivePage(listId);
		}
	}

	                        
	var _PopulateTournamentNavBarButtons = function( tournament_id, elTournamentTab )
	{
		var tournamentNumber = PickemCommon.GetTournamentIdNumFromString( tournament_id );
		var navBarPanel = elTournamentTab.FindChildTraverse( 'content-navbar__tabs' );

		if ( !elTournamentTab.hasSetUpNavBar )
		{

			var _CreateNavBarButton = function( buttonId, buttonTitle, targetTab, oData = null, isSelected = false )
			{
				                                                                                                 
				
				var elButton = $.CreatePanel( 'RadioButton', navBarPanel, buttonId, {
					selected: isSelected,
					group: 'TournamentNavBar' + tournamentNumber
				} );

				$.CreatePanel( 'Label', elButton, '', {
					text: buttonTitle,
					hittest: false
				} );

				elButton.SetPanelEvent( 'onactivate', _NavigateToTab.bind( undefined, targetTab, tournament_id, oData ) );

				return elButton;
			};

			var isCurrentTourament = ( tournamentNumber === g_ActiveTournamentInfo.eventid );

			var restrictions = LicenseUtil.GetCurrentLicenseRestrictions();
			var bDefaultToMatches = ( ( restrictions === false ) && isCurrentTourament ) ? false : true;


			                                                
			                                                                                     
			if ( isCurrentTourament )
			{
				                                                                                                                         
				   	 	
				   		                             
				   		             
				   		                   
				   		                        
				   	    
				_CreateNavBarButton( 
					'id-nav-pick-prelims', 
					$.Localize( '#CSGO_Fantasy_PickEm_Qualifier_Title' ), 
					'JsPickemPrelims', 
					{	
						tournamentid: tournament_id, 
						dayindex: 0, 
						xmltype: 'group',
						oPickemType: PickEmGroup,
					} ,
					!bDefaultToMatches
				);
				                                                                                                                 
				   	 	
				   		                             
				   		             
				   		                 
				   		                        
				   	  
				     
			}

			         
			_m_matchesTab = _CreateNavBarButton( 'id-nav-matches', $.Localize( '#CSGO_Watch_Tournament_Matches_T2' ), 'JsTournamentMatches', null, bDefaultToMatches );


			                                
			                                                            
			    
			   	                                                                                                                     
			   		 	
			   			                             
			   			             
			   			                   
			   			                        
			   		    
			   	                                                                                                              
			   		 	
			   			                             
			   			             
			   			                 
			   			                        
			   		    
			    

			          
			             
			                                                      
			 
				                                                                                                   
			 

			              
			                                                      
			 
				                                                                                                            
			 

			          
			elTournamentTab.hasSetUpNavBar = true;
		}
	};

	                                                                
	var _InitializeTournamentsPage = function( tournament_id )
	{
        var elParentPanel = _GetParentPanel(tournament_id);
        if ( !elParentPanel )
            return;

		elParentPanel.SetDialogVariable( 'tournament_name', $.Localize( "#CSGO_Tournament_Event_Name_" + tournament_id.split( ':' )[ 1 ] ) );
			
		                                                                                                      
		elParentPanel.FindChildInLayoutFile( "id-tournament-title-bar" ).visible = elParentPanel.id !== 'JsActiveTournament';

		_PopulateTournamentNavBarButtons( tournament_id, elParentPanel );
		elParentPanel.FindChildInLayoutFile( "JsTournamentMatches" ).tournament_id = tournament_id;
		elParentPanel.isInitialized = true;
		if ( _m_initalizeHandler )
			$.UnregisterForUnhandledEvent( "InitializeTournamentsPage", _m_initalizeHandler );
			
		var tournamentNumber = PickemCommon.GetTournamentIdNumFromString( tournament_id );
		var isCurrentTourament = ( tournamentNumber === g_ActiveTournamentInfo.eventid );

		var restrictions = LicenseUtil.GetCurrentLicenseRestrictions();
		var bDefaultToMatches = ( ( restrictions === false ) && isCurrentTourament ) ? false : true;

		if ( !bDefaultToMatches )
		{
			_NavigateToTab( 
				"JsPickemPrelims", 
				tournament_id, 
				{	
				tournamentid: tournament_id, 
				dayindex: 0, 
				xmltype: 'group',
				oPickemType: PickEmGroup
			} );
		}
		else
		{
			_NavigateToTab( "JsTournamentMatches", tournament_id );
		}

		_SetUpTournamentInfoLink( elParentPanel, tournament_id );
	};

	var _GetParentPanel = function( tournament_id )
	{
		                                           
		                                               
		
		var elParent =  $( '#tournament_content_' + tournament_id );
		if ( elParent )
		{
			return elParent;
		}

		elParent =  $( '#JsActiveTournament' );
		if ( elParent )
		{
			return elParent;
		}
	};

	var _SetUpTournamentInfoLink = function( elPanel, tournament_id )
    {
        var elLink = elPanel.FindChildInLayoutFile( 'JsTournamentInfoLink' );
        var olinks = {
            14: "https://www.faceitmajor.com/",
            13: "http://www.eleague.com/major-2018",
            12: "https://major.pglesports.com/"
        };

        var tournamentNum = PickemCommon.GetTournamentIdNumFromString( tournament_id );

		if ( olinks.hasOwnProperty( tournamentNum ) )
		{
			var link = olinks[ tournamentNum ];
			
			elLink.SetPanelEvent( 'onactivate', function() { SteamOverlayAPI.OpenURL( link ); } );
            return;
        }

        elLink.visible = false;
    };

	                                                       
	var _CloseSubMenu = function()
	{
		$.DispatchEvent( 'CloseSubMenuContent' );
	};

	function _Refresh( tabid )
	{
		if ( tabid === 'JsWatch' )
		{
			if ( _m_activeTab )
			{
				if ( _m_activeTab.activeMatchInfoPanel )
				{
					matchInfo.ResizeRoundStatBars( _m_activeTab.activeMatchInfoPanel );
					matchList.ReselectActiveTile( _m_activeTab );
				}
			}
		}
	}

	var _RefreshBtnPress = function ()
	{
		_RefreshActivePage( _m_activeTab.tournament_id );
	};


	function _Init()
	{
		_m_activeTab = undefined;
		_m_initalizeHandler = $.RegisterForUnhandledEvent( "InitializeTournamentsPage", _InitializeTournamentsPage );
		$.RegisterForUnhandledEvent( "RefreshPickemPage", _RefreshActivePage );
		$.RegisterForUnhandledEvent( "PanoramaComponent_MatchList_StateChange", _UpdateMatchList );
		$.RegisterForUnhandledEvent( "MainMenuTabShown", _Refresh );
	}

	return {
		CloseSubMenu: _CloseSubMenu,
		NavigateToTab: _NavigateToTab,
		Init: _Init,
		RefreshActivePage: _RefreshActivePage,
		RefreshBtnPress: _RefreshBtnPress
	};

})();

(function()
{
	mainmenu_watch_tournament.Init();
})();