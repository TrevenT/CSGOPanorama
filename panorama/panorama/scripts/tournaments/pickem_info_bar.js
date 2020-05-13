'use strict';

var PickEmInfoBar = ( function()
{
	var _Init = function ( elPanel )
	{
		_SetUpHowToPlayLink( elPanel );
		_SetUpLeaderboardButton( elPanel );
		_UpdateTimer( elPanel );
		_UpdateScore( elPanel );
	};

	var _SetUpHowToPlayLink = function( elPanel )
	{
		var elParent = elPanel.FindChildTraverse( 'id-pickem-info' );
		var elLink = elParent.FindChildTraverse( 'id-pickem-how-to-play' );
		var olinks = {
			14: "http://www.counter-strike.net/pickem/london2018#team_instructions",
			13: "http://www.counter-strike.net/pickem/boston2018#team_instructions",
			12: "http://www.counter-strike.net/pickem/krakow2017#team_instructions"
		};

		var tournamentNum = PickemCommon.GetTournamentIdNumFromString( elPanel._oData.tournamentid );

		if ( olinks.hasOwnProperty( tournamentNum ) )
		{
			var link = olinks[ tournamentNum ];
			elLink.SetPanelEvent( 'onactivate', function() { SteamOverlayAPI.OpenURL( link ); } );
			return;
		}

		elLink.visible = false;
	};

	var _SetUpLeaderboardButton = function( elPanel )
	{
		var elParent = elPanel.FindChildTraverse( 'id-pickem-info' );
		var elLink = elParent.FindChildTraverse( 'id-pickem-leaderboards' );
		var olinks = {
			14: "official_leaderboard_pickem_london2018_team",
			13: "official_leaderboard_pickem_boston2018_team",
			12: "official_leaderboard_pickem_krakow2017_team"
		};

		var tournamentNum = PickemCommon.GetTournamentIdNumFromString( elPanel._oData.tournamentid );

		elLink.enabled = false;

		                                  
		                                                
		    
		   	                                   
		   	                                                                                      
		   	       
		    

		                          
	};

	var _UpdateTimer = function( elPanel )
	{
		var elStatus = elPanel.FindChildTraverse( 'id-pickem-lock-status' );
		var elIcon = elPanel.FindChildTraverse( 'id-pickem-lock-status-icon' );
		var secRemaining = PredictionsAPI.GetGroupRemainingPredictionSeconds( elPanel._oData.tournamentid, elPanel._oGroupData.groupid );

		var sectionId = PredictionsAPI.GetEventSectionIDByIndex( elPanel._oData.tournamentid, elPanel._oData.dayindex );
		var isActive = PredictionsAPI.GetSectionIsActive( elPanel._oData.tournamentid, sectionId );
		var canPick = PredictionsAPI.GetGroupCanPick( elPanel._oData.tournamentid, elPanel._oGroupData.groupid );

		var elStatusBar = elPanel.FindChildTraverse( 'id-pickem-status' );
		elStatusBar.SetHasClass( 'pickem-header-status--active', (isActive && canPick && secRemaining > 0 ) );

		if ( !isActive && canPick )
		{
			                                                                                
			elIcon.SetImage( 'file://{images}/icons/ui/locked.svg' );
			elStatus.text = $.Localize( '#pickem_timer_inactive' );
		   
		}
		else if ( canPick && secRemaining > 0 )
		{
			                                                                               
			elIcon.SetImage( 'file://{images}/icons/ui/clock.svg' );
			elStatus.SetDialogVariable( 'time', FormatText.SecondsToSignificantTimeString( secRemaining ) );
			elStatus.text = $.Localize( '#pickem_timer', elStatus );

			$.Schedule( 1, _UpdateTimer.bind( undefined, elPanel ));
			return;

		}
		else if ( !canPick )
		{
			                                                         
			elIcon.SetImage( 'file://{images}/icons/ui/locked.svg' );
			elStatus.text = $.Localize( '#pickem_timer_locked' );
		}
		else
		{
			                                            
			elIcon.SetImage( 'file://{images}/icons/ui/clock.svg' );
			elStatus.SetDialogVariable( 'time', FormatText.SecondsToSignificantTimeString( 60 ) );
			elStatus.text = $.Localize( '#pickem_timer', elStatus );
		}
	};


	var _UpdateScore = function( elPanel )
	{
		var pointsEarned = PredictionsAPI.GetMyPredictionsTotalPoints( elPanel._oData.tournamentid );
		var bronzePoints = PredictionsAPI.GetRequiredPredictionsPointsBronze( elPanel._oData.tournamentid );
		var silverPoints = PredictionsAPI.GetRequiredPredictionsPointsSilver( elPanel._oData.tournamentid );
		var goldPoints = PredictionsAPI.GetRequiredPredictionsPointsGold( elPanel._oData.tournamentid );

		var elYourPoints = elPanel.FindChildTraverse( 'id-pickem-your-points' );
		elYourPoints.text = ( pointsEarned && pointsEarned > 0 ) ? pointsEarned : '-';

		var nextLevel = '';
		var pointsNeeded = null;
		var elbar = elPanel.FindChildTraverse( 'id-pickem-info' );

		if ( pointsEarned < bronzePoints )
		{
			nextLevel = $.Localize( '#pickem_level_bronze' );
			pointsNeeded = bronzePoints - pointsEarned;
		}
		else if ( pointsEarned >= bronzePoints && pointsEarned < silverPoints )
		{
			nextLevel = $.Localize( '#pickem_level_silver' );
			pointsNeeded = silverPoints - pointsEarned;
			elbar.AddClass( 'pickem-info-bar--bronze' );
		}
		else if ( pointsEarned < goldPoints )
		{
			nextLevel = $.Localize( '#pickem_level_gold' );
			elbar.AddClass( 'pickem-info-bar--silver' );
			pointsNeeded = goldPoints - pointsEarned;
		}
		else if ( pointsEarned >= goldPoints )
		{
			nextLevel = $.Localize( '#pickem_level_gold' );
			elbar.AddClass( 'pickem-info-bar--gold' );
			pointsNeeded = 0;
		}

		var pluralString = pointsNeeded === 1 ? $.Localize( '#pickem_point' ) : $.Localize( '#pickem_points' );
		var elPointsNeeded =  elPanel.FindChildTraverse( 'id-pickem-points-needed' );

		                                   
		elPointsNeeded.SetDialogVariableInt( 'points', pointsNeeded );
		elPointsNeeded.SetDialogVariable( 'plural', pluralString );
		elPointsNeeded.SetDialogVariable( 'level', nextLevel );
	};

	return{
		Init : _Init
	};


} )();
