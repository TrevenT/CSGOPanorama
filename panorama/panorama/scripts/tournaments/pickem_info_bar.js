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

		var tournamentNum = PickemCommon.GetTournamentIdNumFromString( elPanel._oPickemData.oInitData.tournamentid );

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

		var tournamentNum = PickemCommon.GetTournamentIdNumFromString( elPanel._oPickemData.oInitData.tournamentid );

		var _OnActivate = function()
		{
			UiToolkitAPI.ShowCustomLayoutPopupParameters( 
				'', 
				'file://{resources}/layout/popups/popup_leaderboards.xml',
				'type=' + olinks[ tournamentNum  ],
				'none'
			);
		};

		if ( olinks.hasOwnProperty( tournamentNum ) )
		{
			var link = olinks[ tournamentNum ];
			elLink.enabled = true;

			elLink.SetPanelEvent( 'onactivate', _OnActivate );
			return;
		}

		elLink.enabled = false;
	};

	var _UpdateTimer = function( elPanel )
	{
		var activeSectionIdx = elPanel._oPickemData.oInitData.sectionindex;
		var oGroupData = elPanel._oPickemData.oTournamentData.sections[ activeSectionIdx ].groups[ 0 ];
		
		var elStatus = elPanel.FindChildTraverse( 'id-pickem-lock-status' );
		var elIcon = elPanel.FindChildTraverse( 'id-pickem-lock-status-icon' );
		var secRemaining = PredictionsAPI.GetGroupRemainingPredictionSeconds( elPanel._oPickemData.oInitData.tournamentid, oGroupData.id );

		var sectionId = PredictionsAPI.GetEventSectionIDByIndex( elPanel._oPickemData.oInitData.tournamentid, elPanel._oPickemData.oInitData.sectionindex );
		var isActive = PredictionsAPI.GetSectionIsActive( elPanel._oPickemData.oInitData.tournamentid, sectionId );
		var canPick = PredictionsAPI.GetGroupCanPick( elPanel._oPickemData.oInitData.tournamentid, oGroupData.id );

		var elStatusBar = elPanel.FindChildTraverse( 'id-pickem-status' );
		elStatusBar.SetHasClass( 'pickem-header-status--active', ( isActive && canPick && secRemaining > 0 ) );

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
		var pointsEarned = PredictionsAPI.GetMyPredictionsTotalPoints( elPanel._oPickemData.oInitData.tournamentid );
		var bronzePoints = PredictionsAPI.GetRequiredPredictionsPointsBronze( elPanel._oPickemData.oInitData.tournamentid );
		var silverPoints = PredictionsAPI.GetRequiredPredictionsPointsSilver( elPanel._oPickemData.oInitData.tournamentid );
		var goldPoints = PredictionsAPI.GetRequiredPredictionsPointsGold( elPanel._oPickemData.oInitData.tournamentid );
		var oGroupData = elPanel._oPickemData.oTournamentData.sections[ elPanel._oPickemData.oInitData.sectionindex ].groups[ 0 ];
		var canPick = PredictionsAPI.GetGroupCanPick( elPanel._oPickemData.oInitData.tournamentid, oGroupData.id );

		var elYourPoints = elPanel.FindChildTraverse( 'id-pickem-your-points' );
		elYourPoints.text = ( pointsEarned && pointsEarned > 0 ) ? pointsEarned : '-';

		var nextLevel = '';
		var resultLevel = '';
		var pointsNeeded = null;
		var elbar = elPanel.FindChildTraverse( 'id-pickem-info' );
		var elPointsNeeded = elPanel.FindChildTraverse( 'id-pickem-points-needed' );
		var elPointsNeededLabel = elPointsNeeded.FindChildTraverse( 'id-pickem-points-needed-Label' );
		var elPointsResultLabel = elPointsNeeded.FindChildTraverse( 'id-pickem-points-result-Label' );

		if ( !canPick )
		{

			elPointsNeededLabel.visible = false;
			elPointsResultLabel.visible = true;
		
			elPointsNeeded.SetDialogVariableInt( 'points', pointsEarned );
		}
		else
		{
			elPointsNeededLabel.visible = true;
			elPointsResultLabel.visible = false;
		}

		if ( pointsEarned < bronzePoints )
		{
			nextLevel = $.Localize( '#pickem_level_bronze' );
			elPointsResultLabel.visible = false;
			resultLevel = '';
			pointsNeeded = bronzePoints - pointsEarned;
		}
		else if ( pointsEarned >= bronzePoints && pointsEarned < silverPoints )
		{
			nextLevel = $.Localize( '#pickem_level_silver' );
			resultLevel = $.Localize( '#pickem_level_bronze' );
			pointsNeeded = silverPoints - pointsEarned;

			if( !canPick )
				elbar.AddClass( 'pickem-info-bar--bronze' );
		}
		else if ( pointsEarned < goldPoints )
		{
			nextLevel = $.Localize( '#pickem_level_gold' );
			resultLevel = $.Localize( '#pickem_level_silver' );

			if( !canPick )
				elbar.AddClass( 'pickem-info-bar--silver' );
			
			pointsNeeded = goldPoints - pointsEarned;
		}
		else if ( pointsEarned >= goldPoints )
		{
			nextLevel = $.Localize( '#pickem_level_gold' );
			resultLevel = $.Localize( '#pickem_level_gold' );

			if( !canPick )
				elbar.AddClass( 'pickem-info-bar--gold' );
			
			pointsNeeded = 0;
		}

		var pluralString = pointsNeeded === 1 ? $.Localize( '#pickem_point' ) : $.Localize( '#pickem_points' );


		                                   
		elPointsNeeded.SetDialogVariableInt( 'points', pointsNeeded );
		elPointsNeeded.SetDialogVariable( 'plural', pluralString );
		elPointsNeeded.SetDialogVariable( 'level', nextLevel );
		elPointsNeeded.SetDialogVariable( 'result-level', resultLevel );
	};

	return{
		Init : _Init
	};


} )();
