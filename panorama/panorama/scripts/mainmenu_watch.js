'use strict';

var mainmenu_watch = ( function() {

    var _m_activeTab;
    var _m_contextTab;                                                                                                               
    var _m_tabStack = [];
    var _m_contextPanel;
    var _m_myXuid = MyPersonaAPI.GetXuid();
    var MATCHLISTDESCRIPTOR = { "JsLive" : "live",
                                "JsYourMatches" : _m_myXuid,
								"JsDownloaded"  : "downloaded"};
	var MATCHLISTTABBYNAME  = { "live" : "JsLive",
                                                                                                
								"downloaded" : "JsDownloaded" };
	MATCHLISTTABBYNAME[ _m_myXuid ] = "JsYourMatches";


                                                                                                                                                                         
              
                                                                                                                                                                         

    function _PopulateStreamList( parentPanel ) {
        
                                   
        var streamNum = StreamsAPI.GetStreamCount(); 
        var count = 9;
        if (streamNum < 9) {
            count = streamNum;
        }

        var elStreamList = parentPanel.FindChildTraverse("JsStreamList");
        
        for ( var i = 0; i < elStreamList.GetChildCount(); i ++ )
        {
            elStreamList.GetChild( i ).markForDelete = true;
        }        

        if ( count === 0 )
        {
            matchList.ShowListSpinner( false, parentPanel );
            matchList.SetListMessage( $.Localize( "#CSGO_Watch_NoSteams" ), true, parentPanel );
            matchList.ShowInfoPanel( false, parentPanel );
        }
        else
        {
            matchList.SetListMessage( "", false, parentPanel );
            matchList.ShowInfoPanel( true, parentPanel );
        }        

        function _SendToTwitch( streamId )
        {
            var url = StreamsAPI.GetStreamVideoFeedByName(streamId);
            SteamOverlayAPI.OpenExternalBrowserURL(url);
        }

        function _ClearList( elListPanel )
        {
            var activeTiles = elListPanel.Children();
            for ( var i = activeTiles.length - 1; i >= 0; i-- )
            {
                if ( activeTiles[i].markForDelete )
                {
                    if ( elListPanel.activeButton === activeTiles[i] )
                    {
                        elListPanel.activeButton = undefined;
                    }
                    activeTiles[i].checked = false;
                    watchTile.Delete( activeTiles[i] );
                }
            }
        }

        for (var i = 0; i < count; i++) {
            var streamName = StreamsAPI.GetStreamNameByIndex(i);
            var elStreamPanel = elStreamList.FindChildInLayoutFile( "TwitchStream_" + streamName );
            if ( elStreamPanel == undefined )
            {
                var elStreamPanel = $.CreatePanel( 'Button', elStreamList, "TwitchStream_" + streamName);
                var streamCountry = StreamsAPI.GetStreamCountryByName(streamName);
                elStreamPanel.BLoadLayout("file://{resources}/layout/matchtiles/streams.xml", false, false);
                var elStreamText = elStreamPanel.FindChildTraverse( 'Text-Panel' );

                elStreamPanel.FindChildInLayoutFile( 'stream-button__blur-target' ).AddBlurPanel( elStreamText );

                                        
                elStreamPanel.FindChildTraverse('Stream-text').text = StreamsAPI.GetStreamTextDescriptionByName(streamName);
                elStreamPanel.FindChildTraverse('Stream-views').text = StreamsAPI.GetStreamViewersByName(streamName) + " Viewers on " + StreamsAPI.GetStreamDisplayNameByName(streamName);
                
                elStreamPanel.FindChildTraverse( "TwitchThumb" ).SetImage( StreamsAPI.GetStreamPreviewImageByName(streamName) );
                elStreamPanel.FindChildTraverse( "flag" ).SetImage( "file://{images}/flags/" + streamCountry +".png" );

                elStreamPanel.SetPanelEvent('onactivate', _SendToTwitch.bind( undefined, streamName ) );
            }
            elStreamPanel.markForDelete = false;
        }

        _ClearList( parentPanel.FindChildTraverse("JsStreamList") );
    }

                                                                                                                                                                         
                  
                                                                                                                                                                         

    function _PopulateTournamentPage( parentPanel ) {
        
        var elTournamentList = parentPanel.FindChildTraverse("JsTournamentList");

        if (!elTournamentList.FindChildTraverse("other-tournaments")) {

                                              
            elTournamentList.BLoadLayout("file://{resources}/layout/matchtiles/tournament_page.xml", false, false);
                                                                                           
                                                                                                                                                                                                
            var pastTournamentPanel = elTournamentList.FindChildTraverse("other-tournaments");

            for (var i = 13; i >= 1; i--)
            {
                if ( i == 2 ) continue;
                                                         
                var elTournamentPanel = $.CreatePanel( 'Button', pastTournamentPanel, "Tournament_" + i );
                             
                elTournamentPanel.BLoadLayoutSnippet( "tournament_tile" );

                var input = $.Localize("#CSGO_Tournament_Event_NameShort_" + i);
                var fields = input.split(' ');
                elTournamentPanel.FindChildTraverse('title').text = fields[fields.length - 1] + " " + fields[0];

                var iconSource =  'file://{images}/tournaments/events/tournament_logo_' + i + '.svg';

                                                                                                          
                                                                                                          

                $.CreatePanel( 'Image', elTournamentPanel.FindChildTraverse('blur-backing'), 'id-tournament-logo--large', {
                    src: iconSource,
                    texturewidth: 32,
                    textureheight: 32,
                    class: "tournament-logo--large"
                });

                $.CreatePanel( 'Image', elTournamentPanel.FindChildTraverse('image-container'), 'id-tournament-logo--small', {
                    src: iconSource,
                    texturewidth: 100,
                    textureheight: 100,
                    class: "tournament-logo--small"
                });
            

                elTournamentPanel.SetPanelEvent('onactivate', _NavigateToTab.bind(undefined, 'JsMainMenuSubContent_Tournament' + i, 'mainmenu_watch_tournament', 'tournament:' + i, true, true));                
            }
        }
    }

                                                                                                                                                                         
                               
                                                                                                                                                                         

    function _UpdateTab( elTab )
    {
        elTab.SetReadyForDisplay( true );
        elTab.visible = true;

        switch( elTab.id )
        {
            case "JsStreams":
                _PopulateStreamList( elTab );
                break;
            case "JsTournaments":
                _PopulateTournamentPage( elTab );
                break;
            case "JsYourMatches":
            case "JsDownloaded":
            case "JsLive":
                matchList.UpdateMatchList( elTab, MATCHLISTDESCRIPTOR[elTab.id] );
                if ( _m_activeTab.activeMatchInfoPanel )
                {
                    matchInfo.ResizeRoundStatBars( _m_activeTab.activeMatchInfoPanel );
                }
                break;
        }

                                           
                                           
         
                                                                             
                                                                                     

                                                                                    
             
                                                               
                                                         
                                                             
                                                      
             
                                                                                      
             
                                                    

                                          
                 
                                                              
                                                                                         
                           
                 
                
                                                                  
             
                   
           

    }

    function _UpdateActiveTab()
    {
        if ( _m_activeTab )
        {
            _UpdateTab( _m_activeTab );
        }
    }

    function _UpdateMatchList( listId )
    {
		                                                  
		var tabbyid = MATCHLISTTABBYNAME[ listId ];
		if ( tabbyid )
		{
			                                                          
			_UpdateTab( $( "#" + tabbyid ) );
		}
    }

    function _NavigateToTab( tab, xmlName, tournament_id=undefined, isSubTab=false, addToStack=false )
    {
                                       

                                 
        if ( isSubTab && addToStack)
        {
                                                                                             
            if ( _m_tabStack.length > 0 )
            {
                _m_tabStack[_m_tabStack.length - 1].AddClass( "mainmenu-content--hidden" );
            }
            else
            {
                _m_contextPanel.AddClass( "mainmenu-content--hidden" );
            }
        }

                                                               
        var parent;
        if ( isSubTab && !$.GetContextPanel().FindChildInLayoutFile( tab ) )
        {
                                          
            var newPanel = undefined;
        
            parent = $.CreatePanel('Panel',  $( '#JsWatchContent' ), tab );
            parent.AddClass("mainmenu-content--popuptab");
            parent.AddClass("mainmenu-content--hidden");
            parent.AddClass("mainmenu-content__container");
            parent.AddClass("no-margin");
            parent.AddClass('hide');
            newPanel = $.CreatePanel('Panel', parent, "tournament_content_" + tournament_id );
            newPanel.Data().elMainMenuRoot = $.GetContextPanel().Data().elMainMenuRoot;
            parent.RemoveClass('hide');
            parent.RemoveClass( 'mainmenu-content--hidden' );
            parent.tournament_id = tournament_id;

            newPanel.BLoadLayout('file://{resources}/layout/' + xmlName + '.xml', false, false );
            newPanel.RegisterForReadyEvents( true );
            parent.isSubTab = true;
			
			                                                                          
			                                                       
            _InitResourceManagement( newPanel );
            $.DispatchEvent( 'InitializeTournamentsPage', tournament_id );
        }
        
        var pressedTab = $( '#' + tab );

        if ( _m_activeTab != pressedTab)
        {
            if ( !isSubTab ) 
            {
                if ( _m_activeTab )
                {
                    if ( !_m_activeTab.isSubTab )
                    {
                        _m_activeTab.AddClass( 'WatchMenu--Hide' );
                    }
                    else
                    {
                        _m_activeTab.AddClass( 'mainmenu-content--hidden' );
                    }
                }

                _m_activeTab = pressedTab;
                _m_contextTab = pressedTab;
                _m_contextPanel.RemoveClass( "mainmenu-content--hidden" );
                
                if ( !_m_activeTab )
                {
                    return;
                }
                _m_activeTab.RemoveClass( 'WatchMenu--Hide' );
            }
            else
            {
                if ( !addToStack ) _m_activeTab.AddClass( 'mainmenu-content--hidden' );
                _m_activeTab = pressedTab;
                _m_activeTab.SetFocus();
                
                if ( !_m_activeTab )
                {
                    return;
                }
                _m_activeTab.RemoveClass( 'mainmenu-content--hidden' );
                if ( _m_activeTab.tournament_id )
                {
                    matchList.ReselectActiveTile( _m_activeTab );
                }
                if ( addToStack ) _m_tabStack.push( _m_activeTab );
            }
        }

        _UpdateTab( _m_activeTab );
    }

    function _CloseSubMenuContent ( ) 
    {
        if ( ( !_m_tabStack ) || ( _m_tabStack.length == 0 ) || ( !_m_tabStack[ _m_tabStack.length - 1 ].visible ) )
        {
            return false;
        }
        _m_tabStack.pop();
                                                                       
        if ( _m_tabStack.length >= 1 )
        {
            _NavigateToTab( _m_tabStack[ _m_tabStack.length - 1 ].id, undefined, true, false );
        }
                                                                                 
        else
        {
            _NavigateToTab( _m_contextTab.id );
        }
        return true;
    }
    
    function _InitResourceManagement( elTab )
    {
        elTab.OnPropertyTransitionEndEvent = function ( panelName, propertyName )
        {
            if( elTab.id === panelName && propertyName === 'opacity')
            {
                                                         
                if( elTab.visible === true && elTab.BIsTransparent() )
                {
                                                                   
                    elTab.visible = false;
                    elTab.SetReadyForDisplay( false );
                    return true;
                }
            }

            return false;
        }			

        $.RegisterEventHandler( 'PropertyTransitionEnd', elTab, elTab.OnPropertyTransitionEndEvent );
    }

    function _InitTab( tab )
    {
        var elTab = $( '#' + tab );
        elTab.BLoadLayoutSnippet( "MatchListAndInfo" );

        _InitResourceManagement( elTab );
    }

    function _Refresh( tabid )
    {
        if ( tabid === 'JsWatch' )
        {
            if ( _m_activeTab )
            {
                if ( _m_activeTab.activeMatchInfoPanel )
                {
                    matchInfo.ResizeRoundStatBars( _m_activeTab.activeMatchInfoPanel );
                }
            }
        }
    }


                                                                                                                                                                         
                         
                                                                                                                                                                         
    
    function _InitMainWatchPanel()
    {
        _m_activeTab = undefined;
        _m_contextPanel = $( "#main-content" );
        $.RegisterForUnhandledEvent( "PanoramaComponent_MatchList_StateChange", _UpdateMatchList );
        $.RegisterForUnhandledEvent( "CloseSubMenuContent", _CloseSubMenuContent );
        $.RegisterForUnhandledEvent( "NavigateToTab", _NavigateToTab );
        $.RegisterForUnhandledEvent( "MainMenuTabShown", _Refresh );
        _InitTab( 'JsYourMatches' );
        _InitTab( 'JsDownloaded')
        _InitTab( 'JsLive' );
        _InitResourceManagement( $( '#JsTournaments' ) );
        _InitResourceManagement( $( '#JsStreams' ) );
        _NavigateToTab( 'JsYourMatches' );
    }

                          
	return {
        NavigateToTab			: _NavigateToTab,                        
        UpdateActiveTab         : _UpdateActiveTab,
                                                       
        InitMainWatchPanel      : _InitMainWatchPanel,
        CloseSubMenuContent     : _CloseSubMenuContent
    };

})();

                                                                                                    
                                           
                                                                                                    
(function()
{
    $.RegisterEventHandler( 'Cancelled', $('#JsWatch'), mainmenu_watch.CloseSubMenuContent );
})();


          
                                                                               
      
                                  
      
                    
                                                     
