"use strict";

var ContextMenuWatchNoticeMatchStream = (function () {

	var _m_arrStreams = undefined;
	var _m_cP = $.GetContextPanel();
	var _m_myCountryCode = undefined;
	var _m_oPriorityMap = {};


	function _Init()
	{
		$.RegisterForUnhandledEvent( 'Tournaments_RequestMatch_Response', _RequestMatchString_Received);

		var matchId = _m_cP.GetAttributeString( "match_id", "" );

		                                                                      
		$.DispatchEvent( 'Tournaments_RequestMatch', matchId );

		_m_cP.SetFocus();
	}




	                                                        
	function _SortStreams ( arrStreams )
	{
		_m_oPriorityMap = {};

		for ( var i in arrStreams )
		{
			var cc = arrStreams[ i ][ 'iso' ].toLowerCase();

			if ( !( cc in _m_oPriorityMap  ) )
			{
				if ( cc == _m_myCountryCode )
				{
					_m_oPriorityMap[ cc ] = 0;
				}
				else
				{
					_m_oPriorityMap[ cc ] = Object.keys( _m_oPriorityMap ).length + 1;
				}
			}
		}

		function _StreamCompareFunction ( a, b )
		{
			var alc = a[ 'iso' ].toLowerCase();
			var blc = b[ 'iso' ].toLowerCase();
	
			return _m_oPriorityMap[ alc ] - _m_oPriorityMap[ blc ];
		}

		arrStreams.sort( _StreamCompareFunction );
	}

	function _RequestMatchString_Received( matchString )
	{
		if ( _m_arrStreams != undefined )
			return;
			
		var oMatch = JSON.parse( matchString );
		
		if ( oMatch == undefined )
		{
			$.DispatchEvent( 'ContextMenuEvent', '' );
			return;		
		}

		_m_arrStreams = oMatch[ 'streams' ];

		if ( _m_arrStreams.length == 0 )
		{

			var elNoStreamLabel = $.GetContextPanel().FindChildTraverse( "id-watchnotice__event__match__no-stream" );
			elNoStreamLabel.RemoveClass( 'hidden' );
		}

		_m_myCountryCode = MyPersonaAPI.GetMyCountryCode().toLowerCase();

		_SortStreams( _m_arrStreams );
		
		for ( var jdx in _m_arrStreams )
		{
			var oStream = oMatch[ 'streams' ][ jdx ];

			var countryCode = oStream[ 'iso' ].replace( "world", "us" );

			                           
			var elStreamContainer = $.GetContextPanel().FindChildTraverse( 'id-watchnotice__event__match__stream-container' );

			if ( elStreamContainer != undefined && elStreamContainer.IsValid() )
			{
				var elStream = $.CreatePanel( 'Button', elStreamContainer, oStream[ 'stream_id' ] );
				                                                                                           
				elStream.AddClass( "eventsched-match__stream" );

				elStream.BLoadLayoutSnippet( "snippet-cm-watchnotice-stream" );

				var elStreamIcon = elStream.FindChildTraverse( 'id-eventsched-match__stream__flag' );
				elStreamIcon.SetImage( "file://{images}/flags/" + countryCode + ".png" );


				var elStreamName = elStream.FindChildTraverse( 'id-eventsched-match__stream__name' );
				if ( elStreamName )
				{
					elStreamName.SetDialogVariable( 'stream_country', $.Localize( "SFUI_Country_" + countryCode ) )

					                                                                                        
					var streamName = "";

					if ( oStream[ 'resolved_embed' ].search( "channel=" ) != -1 )
					{
						streamName = "Twitch: " + oStream[ 'resolved_embed' ].match("channel=(.*?(?=&))")[1];
					}
					else if ( oStream[ 'site' ].toLowerCase().search( "youtube" ) != -1 )
					{
						streamName = "YouTube";
					}
						
					elStreamName.SetDialogVariable( 'stream_site', streamName );
				}

				var url = oStream[ 'resolved_embed' ];
				
				var onActivate = function( url )
				{
					StoreAPI.RecordUIEvent( "WatchNoticeSchedMatchView" );
					SteamOverlayAPI.OpenUrlInOverlayOrExternalBrowser( url );
					$.DispatchEvent( 'ContextMenuEvent', '' );
				}

				elStream.SetPanelEvent( 'onactivate', onActivate.bind( undefined, url ) );
			}

		}

		      
		if ( 'match_page_url' in oMatch )
		{
			var url = oMatch[ 'match_page_url' ];
			var elLinkBtn = $.GetContextPanel().FindChildTraverse( "id-watchnotice__event__match" );

			var onActivate = function ( url )
			{
				StoreAPI.RecordUIEvent( "WatchNoticeSchedMatchLink" );
				SteamOverlayAPI.OpenUrlInOverlayOrExternalBrowser( url ); 
			}

			elLinkBtn.SetPanelEvent( 'onactivate', onActivate.bind( undefined, url ) );
		}


	};

	
	return {
		Init: _Init,
	};

} )();

                                                                                                    
                                           
                                                                                                    
(function()
{
})();