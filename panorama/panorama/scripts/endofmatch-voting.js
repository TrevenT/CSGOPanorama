'use strict';


var EOM_Voting = (function () {

	var _m_pauseBeforeEnd = 2.0;	
	var _m_cP = $( '#eom-voting' );

                                                     

	var _m_elVoteItemPanels = {};
	var _m_updateJob = undefined;
	var m_randIdx = 0;
	
	function _DisplayMe ()
	{

		if ( GameStateAPI.IsDemoOrHltv() )
		{
			return false;
		}

		       
		var oTime = GameStateAPI.GetTimeDataJSO();

		if ( !oTime )
		{ 
			return false;
		}
		

		_m_pauseBeforeEnd = oTime[ "time" ];

		                        
		var oMatchEndVoteData = _m_cP.NextMatchVotingData;

		if ( !oMatchEndVoteData || !oMatchEndVoteData[ "voting_options" ] )
		{
			return false;
		}

		var elMapSelectionList = _m_cP.FindChildInLayoutFile( 'id-map-selection-list' );

		                                           
		  

		Object.keys( oMatchEndVoteData[ "voting_options" ] ).forEach( function( key, index ) {

			var type = oMatchEndVoteData[ "voting_options" ][ key ][ "type" ];

			            
			if ( type == "separator" )
			{
			                                                                                                                   
				var elVoteItem = $.CreatePanel( "Panel", elMapSelectionList, "" );
				elVoteItem.AddClass( "vote-item--separator" );
			}
			else
			{
				var text = "undefined";

				var elVoteItem = $.CreatePanel( "RadioButton", elMapSelectionList, "id-vote-item--" + key );
				elVoteItem.BLoadLayoutSnippet( "MapGroupSelection" );
				elVoteItem.group = "radiogroup_vote";

				elVoteItem.m_key = key;

				if ( type == "skirmish" )
				{
					var skirmishId = oMatchEndVoteData[ "voting_options" ][ key ][ "id" ];

					var text = $.Localize( GameTypesAPI.GetSkirmishName( skirmishId ) );

					var cfg = GameTypesAPI.GetConfig();
					if ( cfg )
					{
						var mg = cfg.mapgroups[ 'mg_skirmish_' + GameTypesAPI.GetSkirmishInternalName( skirmishId ) ];
						if ( mg )
						{
							Object.keys( mg.maps ).forEach( function( map, i )
							{
								var elMapImage = $.CreatePanel( 'Panel', elVoteItem.FindChildInLayoutFile( 'MapGroupImagesCarousel' ), 'MapSelectionScreenshot' + i );
								elMapImage.AddClass( 'map-selection-btn__screenshot' );
								elMapImage.style.backgroundImage = 'url("file://{images}/map_icons/screenshots/360p/' + map + '.png")';
								elMapImage.style.backgroundPosition = '50% 0%';
								elMapImage.style.backgroundSize = 'auto 100%';
							} );
						}
					}

					var elMapIcon = elVoteItem.FindChildInLayoutFile( "id-map-selection-btn__modeicon" );

					var modeIcon = "file://{images}/icons/ui/" + GameTypesAPI.GetSkrimishIcon( skirmishId ) + ".svg";
					elMapIcon.SetImage( modeIcon );

					elMapIcon.RemoveClass( 'hidden' );
				}
				else if ( type == "map" )
				{
					var internalName = oMatchEndVoteData[ "voting_options" ][ key ][ "name" ];

					var text = GameTypesAPI.GetFriendlyMapName( internalName );
					
					                                                           
					var image = 'url("file://{images}/map_icons/screenshots/360p/' + internalName + '.png")';

					var elMapImage = $.CreatePanel( 'Panel', elVoteItem.FindChildInLayoutFile( 'MapGroupImagesCarousel' ), 'MapSelectionScreenshot' );
					elMapImage.AddClass( 'map-selection-btn__screenshot' );
	
					if ( image )
					{
						elMapImage.style.backgroundImage = image;
						elMapImage.style.backgroundPosition = '50% 0%';
						elMapImage.style.backgroundSize = 'auto 100%';
					}	
				}
				else
				{
					  	
				}

				elVoteItem.FindChildTraverse( "MapGroupName" ).text = text;


				                  
				var onActivate = function( element )
				{
					GameInterfaceAPI.ConsoleCommand( "endmatch_votenextmap" + " " + element.m_key );

					                       
					elMapSelectionList.FindChildrenWithClassTraverse( "map-selection-btn" ).forEach( btn => btn.enabled = false );
				}

				elVoteItem.SetPanelEvent( 'onactivate', onActivate.bind( undefined, elVoteItem ) );

				_m_elVoteItemPanels[ index ] = elVoteItem;

			}	

		});

		_UpdateVotes();

		return true;

	}

	var _UpdateVotes = function() {

		        
		var oMatchEndVoteData = _m_cP.NextMatchVotingData;

		if ( !oMatchEndVoteData )
		{
			_Shutdown();
			
			return;
		}

		var _GetWinningMaps = function() {

			                         
			var arrVoteWinnersKeys = [];

			var highestVote = 0;

			                              
			Object.keys( oMatchEndVoteData[ "voting_options" ] ).forEach( function( key )
			{
				var nVotes = oMatchEndVoteData[ "voting_options" ][ key ][ "votes" ];

				if ( nVotes > highestVote )
					highestVote = nVotes;
			});

			                           
			Object.keys( oMatchEndVoteData[ "voting_options" ] ).forEach( function( key )
			{
				var nVotes = oMatchEndVoteData[ "voting_options" ][ key ][ "votes" ];

				if ( ( nVotes === highestVote ) &&
				( oMatchEndVoteData[ "voting_options" ][ key ][ 'type' ] != 'separator' ) )
				arrVoteWinnersKeys.push( key );
			});
			
			return arrVoteWinnersKeys;
		}

		if ( oMatchEndVoteData )
		{
			                               
			  
			if ( oMatchEndVoteData[ "voting_done" ] == "1" )
			{
				var elMapSelectionList = _m_cP.FindChildInLayoutFile( 'id-map-selection-list' );
				
				                      
				elMapSelectionList.FindChildrenWithClassTraverse( "map-selection-btn" ).forEach( btn => btn.enabled = false );

				var winner = oMatchEndVoteData[ "voting_winner" ];

				                                       

				if ( winner !== -1 )
				{
					var winningIndex;

					Object.keys( _m_elVoteItemPanels ).forEach( function( key )
					{
						if ( _m_elVoteItemPanels[ key ].m_key == winner )
							winningIndex = key;
					} );

					if ( _m_elVoteItemPanels[ winningIndex ] )
					{
						                          
						var elCheckmark =  _m_elVoteItemPanels[ winningIndex ].FindChildTraverse('id-map-selection-btn__winner' );
						elCheckmark.AddClass( "appear" );
					}

				}
				else
				{
					var arrWinners = _GetWinningMaps();

					                 
					                                                              

					var randIdx;

					if ( arrWinners.length > 2 )
					{
						randIdx = Math.floor( Math.random() * arrWinners.length );
					}

					if ( arrWinners.length <= 2 || randIdx == m_randIdx )
					{
						m_randIdx++;
					}
					else
					{
						m_randIdx = randIdx;
					}
					
					
					if ( m_randIdx >= arrWinners.length )
					{
						m_randIdx = 0;
					}

					var elMapSelectionList = _m_cP.FindChildInLayoutFile( 'id-map-selection-list' );

					var elVoteItem = elMapSelectionList.FindChildTraverse( "id-vote-item--" + arrWinners[ m_randIdx ] );
					var panelToHilite = elVoteItem.FindChildTraverse( "id-map-selection-btn__gradient" );
					
					panelToHilite.RemoveClass( "map-selection-btn__gradient--whiteout" );
					panelToHilite.AddClass( "map-selection-btn__gradient--whiteout" );

					_m_updateJob = $.Schedule( 0.3, _UpdateVotes );
					return;
				}
			}
			else
			{
				Object.keys( _m_elVoteItemPanels ).forEach( function( key ) {

					var elVoteItem = _m_elVoteItemPanels[ key ];
					var oVoteOptions = oMatchEndVoteData[ "voting_options" ][ _m_elVoteItemPanels[ key ].m_key ];

					                    
					  
					var elVoteCountLabel = elVoteItem.FindChildTraverse( "id-map-selection-btn__count" );

					var votes = oVoteOptions[ "votes" ];
					var votesNeeded = oMatchEndVoteData[ "votes_to_succeed" ];

					elVoteCountLabel.text = "<font color='#ffc130'>" + votes + '</font>/' + votesNeeded;


				});
			}

			_m_updateJob = $.Schedule( 0.1, _UpdateVotes );

		}

	}

	function _Shutdown()
	{
		if ( _m_updateJob )
			$.CancelScheduled( _m_updateJob );
	
		_m_updateJob = undefined;
	}

                                                         
                                                                      
  
  

	function _Start() 
	{
			
		if ( _DisplayMe() )
		{
			EndOfMatch.SwitchToPanel( 'eom-voting' );

			                                                     
			
			$.Schedule( _m_pauseBeforeEnd, _End );
		}
		else
		{
			_End();
		}	
	}


	function _End() 
	{
  		            

		$.DispatchEvent( 'EndOfMatch_ShowNext' );
	}


                      
return {

	Start: _Start,
	Shutdown: _Shutdown,
	
};


})();


                                                                                                    
                                           
                                                                                                    
(function () {

	EndOfMatch.RegisterPanelObject( EOM_Voting );


})();
