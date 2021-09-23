
'use strict';

	                   
	                             

var OperationMission = ( function()
{
	var _m_missionPrefix = 'id-mission-';
	var nMissionsCompleteWithUncommittedPoints = 0;

	var _CreateMission = function( elContainer, oMissionDetails, isUnlocked )
	{
		                                                                                                                    

		var elMission = null;

		if ( !elContainer.FindChildInLayoutFile( oMissionDetails.missionId ) )
		{
			elMission = _LoadMissonSnippet(elContainer, oMissionDetails);
		}
		else
		{
			elMission = elContainer.FindChildInLayoutFile( oMissionDetails.missionId );
			
			                                                                   
			                                                                                                               
			if( oMissionDetails.nMissionPointsRemaining === 0 && !elMission.BHasClass( 'complete' ))
			{
				elMission.DeleteAsync(0);
				elMission = _LoadMissonSnippet(elContainer, oMissionDetails);
			}
		}

		elMission.enabled = isUnlocked;
		return elMission;
	};

	var _LoadMissonSnippet = function( elContainer, oMissionDetails )
	{
		var elMission = $.CreatePanel( 'Button',
			elContainer,
			oMissionDetails.missionId
		);

		elMission.BLoadLayout( 'file://{resources}/layout/operation/operation_mission_snippets.xml', false, false );
		return elMission;
	};

	var _UpdateMissionDisplay = function( elMission, oMissionDetails, isunlocked, missionCardId = null, bHideDesc = false )
	{
		                                                                                                        
		                                                                                                                                 
		                                                                                                      

		                                                                                          
		                                                                                                                                  
		                                                                                                       
		                                                                                                                                                 
		                                                                       
		                                                                         

		                            
		var goal = MissionsAPI.GetQuestPoints( oMissionDetails.missionId, "goal" );
		if ( !goal || goal === -1 )
		{
			return;
		}

		_UpdateMissionName( elMission, oMissionDetails.missionItemId );

		if ( !bHideDesc )
		{
			bHideDesc = oMissionDetails.missonType === 'or';
		}
		
		_UpdateMissionDesc( elMission, oMissionDetails.missionId, bHideDesc );
		_UpdateMissionIcon( elMission, isunlocked, oMissionDetails );
		_EnableDisableMission( elMission, isunlocked, oMissionDetails );

		if ( missionCardId )
		{
			_AddMissionActions( elMission, oMissionDetails, missionCardId );
		}
		
		var elParent = elMission.FindChildInLayoutFile( 'id-mission-segments-container' );

		if ( oMissionDetails.missonType === 'or' )
		{
			var oCompletedOrQuest = oMissionDetails.aSubQuests.filter( element => element.nsubQuestPointsRemaining === 0 )[ 0 ];

			if ( oCompletedOrQuest )
			{
				var elContainer = LoadSnippetByType( elParent, missionPanelId, "snippet-mission-segment-container" );
				_UpdateMissionDesc( elMission, oCompletedOrQuest.missionId, bHideDesc = false );
				_UpdateSegmentsMissionTypes( oMissionDetails, elContainer, oCompletedOrQuest, 0 );
			}
			else
			{
				nMissionsCompleteWithUncommittedPoints = 0;
				for ( var i = 0; i < oMissionDetails.aSubQuests.length; i++ )
				{
					_UpdateOrTypeMission( oMissionDetails, elParent, i );
				}
			}
		}
		else
		{
			var missionPanelId = _m_missionPrefix + oMissionDetails.missionId;
			var elContainer = LoadSnippetByType( elParent, missionPanelId, "snippet-mission-segment-container" );

			for ( var i = 0; i < oMissionDetails.nMissionSegments; i++ )
			{
				_UpdateSegmentsMissionTypes( oMissionDetails, elContainer, oMissionDetails.aSegmentsData[ i ], i );
			}
		}

		elMission.SetHasClass( 'complete', oMissionDetails.nMissionPointsRemaining === 0 && isunlocked );
		elMission.SetHasClass( 'hidebar', MatchStatsAPI.GetGameMode() === "cooperative" && GameStateAPI.IsLocalPlayerPlayingMatch() );

		                            	                                     
		                          		                                    
		                 				                                  
		                 				                                
		                   			                              
		                                                                                                              

		MissionsAPI.ApplyQuestDialogVarsToPanelJS( Number( oMissionDetails.missionItemId ), elMission );
	};

	var _UpdateOrTypeMission = function( oMissionDetails, elParent, index )
	{
		var oSubQuestData = oMissionDetails.aSubQuests[ index ];
		var elContainer = LoadSnippetByType( elParent, _m_missionPrefix + oSubQuestData.missionId, "snippet-mission-segment-container-or-type" );
		elContainer.SetDialogVariableInt( 'points', oSubQuestData.nGoal );

		_UpdateMissionDesc( elContainer, oSubQuestData.missionId, false );

		var segmentPanelId = _m_missionPrefix + oSubQuestData.missionId + '_segment' + index;
		_CreateBars( elContainer.FindChildInLayoutFile( 'id-mission-bar' ),
			oSubQuestData,
			oMissionDetails,
			segmentPanelId
		);

		oSubQuestData.nPreviousGoal = 0;                                                                            
		var nEarnedDisplay = _GetTotalPointsEarned( oSubQuestData.nUncommitted, oSubQuestData.nEarned, oSubQuestData.nGoal, oSubQuestData.nPreviousGoal );
		var elCount = _CreateSectionCount( elContainer.FindChildInLayoutFile( 'id-mission-bar' ), oSubQuestData, nEarnedDisplay );

		var isMissionCompleteWithUncommittedPoints = ( ( nEarnedDisplay >= oSubQuestData.nGoal ) && oMissionDetails.nMissionPointsRemaining > 0 ) 
		nMissionsCompleteWithUncommittedPoints = isMissionCompleteWithUncommittedPoints ?
			++ nMissionsCompleteWithUncommittedPoints :
			nMissionsCompleteWithUncommittedPoints;

		elCount.SetHasClass( 'uncommitted', isMissionCompleteWithUncommittedPoints );

		if ( index === 0 )
		{
			var starsPanelId = _m_missionPrefix + "sudquest-stars" + oSubQuestData.missionId;
			var elStarsContainer = LoadSnippetByType( elParent, starsPanelId, "snippet-mission-stars-container-or-type" );
		
			for ( var k = 0; k < oMissionDetails.nOpPointsPerSegment; k++ )
			{
				var starPanelId = _m_missionPrefix + oSubQuestData.missionId + '_star' + k;
				var elStar = _CreateMissionStar(
					elStarsContainer.FindChildInLayoutFile( 'id-mission-segments-stars' ),
					oMissionDetails.aSegmentsData[ 0 ],
					oMissionDetails,
					starPanelId,
					nEarnedDisplay );

				elStar.SetHasClass( 'uncommitted', nMissionsCompleteWithUncommittedPoints > 0 );
			}
		}
	};

	var _UpdateSegmentsMissionTypes = function( oMissionDetails, elContainer, oSegmentData, index )
	{	
		var segmentPanelId = _m_missionPrefix + oMissionDetails.missionId + '_segment' + index;
		_CreateBars( elContainer,
			oSegmentData,
			oMissionDetails,
			segmentPanelId );

		var nUncommittedForSegment = _GetUncommittedSegmentPoints( oMissionDetails, oSegmentData )
		var nEarnedDisplay = oMissionDetails.isReplayable ? oSegmentData.nEarned :
			oSegmentData.isComplete ? oSegmentData.nGoal :
			_GetTotalPointsEarned(
				nUncommittedForSegment,
				oSegmentData.nSegmentEarned,
				oSegmentData.nGoal,
				oSegmentData.nPreviousGoal );

		if ( oMissionDetails.nMissionSegments === 1 )
		{
			var elCount = _CreateSectionCount( elContainer, oSegmentData, nEarnedDisplay );
			elCount.SetHasClass( 'uncommitted', ( nUncommittedForSegment + oSegmentData.nSegmentEarned ) === oSegmentData.nGoal && !oSegmentData.isComplete );
		}

		for ( var k = 0; k < oMissionDetails.nOpPointsPerSegment; k++ )
		{
			var starPanelId = _m_missionPrefix + segmentPanelId + '_star' + k;
			var elStar = _CreateMissionStar( elContainer, oSegmentData, oMissionDetails, starPanelId, nEarnedDisplay );

			elStar.SetHasClass( 'uncommitted', ( nUncommittedForSegment + oSegmentData.nEarned ) === oSegmentData.nGoal && !oSegmentData.isComplete );
		}
	};

	var _GetUncommittedSegmentPoints = function( oMissionDetails, oSegmentData )
	{
		var nUncommittedForSegment = 0
		if( oMissionDetails.aSubQuests && oMissionDetails.aSubQuests.length > 0 )
		{
			for ( var j = 0; j < ( oSegmentData.nSegmentIncrementalGoalDelta + oSegmentData.nPreviousGoal); j++ )
			{
				nUncommittedForSegment += oMissionDetails.aSubQuests[ j ].nUncommitted;
			}
		}

		return nUncommittedForSegment;
	}

	var _UpdateMissionDesc = function ( elMission, missionId, bhideDesc )
	{
		elMission.SetHasClass( 'hide-desc', bhideDesc );
		if( bhideDesc )
			return;

		var nQuestID = Number( missionId );
		var elMissionDescLabel = elMission.FindChildInLayoutFile( 'id-mission-desc' );
		elMissionDescLabel.visible = true;
		OperationUtil.SetLocalizationStringAndVarsForMission( elMissionDescLabel, nQuestID, "loc_description" );
	};

	var _HudIncompleteSubMissions = function( elMission, aIncompleteMissions )
	{
		var elContainer = elMission.FindChildInLayoutFile( 'id-snippet-hud-next-subquests' );
		
		if( aIncompleteMissions.length > 0 )
		{
			for ( var i = 0; i < aIncompleteMissions.length; i++ )
			{
				var elSegment = LoadSnippetByType( elContainer, aIncompleteMissions[i].missionId , "snippet-hud-next-subquest" );
				OperationUtil.SetLocalizationStringAndVarsForMission(
					elSegment.FindChildInLayoutFile( 'id-subquest-desc' ),
					Number( aIncompleteMissions[i].missionId ), "loc_description" );
			}
		}

		var aChildren = elContainer.Children();
		aChildren.forEach( element => {
			if( MissionsAPI.GetQuestPoints( Number( element.id ), "uncommitted" ) > 0 )
			{
				elContainer.MoveChildBefore( element, elContainer.GetChild( 0 ) );
				element.AddClass( 'uncommitted' );
				
				$.Schedule( 1.5, function(){ element.AddClass( 'hide-submission' ) });
			}
		});
	}

	var _UpdateMissionName = function ( elMission, missionItemId )
	{
		elMission.FindChildInLayoutFile( 'id-mission-name' ).text = InventoryAPI.GetItemName( missionItemId );
	}

	var _UpdateMissionIcon = function( elMission, isunlocked, oMissionDetails )
	{
		var currentlyPlayingMissionId = GameStateAPI.GetActiveQuestID();
		var elIcon = elMission.FindChildInLayoutFile( 'id-mission-card-icon-play' );
		elIcon.visible = oMissionDetails.nMissionPointsRemaining !== 0 && 
			isunlocked && 
			currentlyPlayingMissionId !== oMissionDetails.missionId;

		elIcon.SetImage( 'file://{images}/icons/ui/' + oMissionDetails.missionGameMode + '.svg' );
		elIcon.SetHasClass( 'nocolor', ( oMissionDetails.missionGameMode.startsWith( 'competitive' ) || 
			oMissionDetails.missionGameMode === 'survival' ));

		elMission.FindChildInLayoutFile( 'id-mission-card-icon-locked' ).visible = !isunlocked;
		elMission.FindChildInLayoutFile( 'id-mission-card-icon-complete' ).visible = !oMissionDetails.isReplayable &&
			oMissionDetails.nMissionPointsRemaining === 0 &&
			isunlocked;
		elMission.FindChildInLayoutFile( 'id-mission-card-spinner' ).visble = isunlocked && currentlyPlayingMissionId === oMissionDetails.missionItemId;
		elMission.FindChildInLayoutFile( 'id-mission-card-icon-replay' ).visible = oMissionDetails.isReplayable &&
			oMissionDetails.nMissionPointsRemaining === 0 &&
			isunlocked;
	};

	var _EnableDisableMission = function( elMission, isunlocked, oMissionDetails)
	{
		                                             
		elMission.enabled = isunlocked &&
		( oMissionDetails.nMissionPointsRemaining !== 0 ||
			oMissionDetails.isReplayable );
	};

	var _AddMissionActions = function( elMission, oMissionDetails, missionCardId )
	{
		elMission.SetPanelEvent( 'onactivate',
			_SetMissionOnActivate.bind(
				undefined, 
				missionCardId, 
				oMissionDetails.missionItemId, 
				OperationUtil.GetOperationInfo().nSeasonAccess
		) );

		if( oMissionDetails.missonType === 'checklist' || oMissionDetails.missonType === 'sequential' )
		{
			elMission.SetPanelEvent( 'onmouseover',
				_ShowMissionTooltip.bind(
					undefined,
					elMission,
					oMissionDetails
			));

			elMission.SetPanelEvent( 'onmouseout', _HideMissionTooltip )
		}
		else
		{
			elMission.ClearPanelEvent( 'onmouseover' );
			elMission.ClearPanelEvent( 'onmouseout' );
		}
	};

	var _CreateBars = function( elContainer, oSegmentData, oMissionDetails, segmentPanelId, )
	{
		var nSegments = oMissionDetails.missonType === 'or' ? 1 : oSegmentData.nSegmentIncrementalGoalDelta;
		var isSingleBar = ( oMissionDetails.nMissionSegments === 1 || oMissionDetails.missonType === 'or' ) ? true : false;

		for ( var i = 0; i < nSegments; i++ )
		{
			var segmentSubMissionPanelId = segmentPanelId + 'sub_' + i;
			var elBar = LoadSnippetByType( elContainer, segmentSubMissionPanelId, "snippet-mission-segment" );
			elBar.SetHasClass('op_mission-card__mission__bar-container-seq', oMissionDetails.missonType === 'sequential');
			elBar.SetHasClass( 'op-mission-card__mission__bar-container--no-y-offset', isSingleBar );

			var nPercentComplete = 0;
			var nPercentCompleteUncommitted = 0;
			
			if( oMissionDetails.missonType === 'or' )
			{
				nPercentComplete = oSegmentData.nPercentComplete;
				nPercentCompleteUncommitted = oSegmentData.nPercentCompleteUncommitted;
			}
			else if ( oMissionDetails.isReplayable )
			{
				nPercentComplete = oSegmentData.nPercentComplete;
			}
			else if ( oMissionDetails.aSubQuests )
			{
				nPercentComplete = oMissionDetails.aSubQuests[ oSegmentData.nPreviousGoal + i ].nPercentComplete;
				nPercentCompleteUncommitted = oMissionDetails.aSubQuests[ oSegmentData.nPreviousGoal + i ].nPercentCompleteUncommitted;
			}

			elBar.FindChildInLayoutFile( 'id-mission-card-bar' ).style.width = nPercentComplete + '%;';
			elBar.FindChildInLayoutFile( 'id-mission-card-bar-uncommitted' ).style.width = nPercentCompleteUncommitted + '%;';
		}
	};


	var _CreateMissionStar = function( elContainer, oSegmentData, oMissionDetails, starPanelId, nEarned )
	{
		var elStar = LoadSnippetByType( elContainer, starPanelId, "snippet-mission-star" );
		elStar.SetHasClass( 'complete', oSegmentData.isComplete );

		if( oMissionDetails.nMissionSegments > 1 )
		{
			elStar.SetDialogVariableInt( 'mission_points_goal', oSegmentData.nGoal );
			elStar.SetDialogVariableInt('mission_points_earned', nEarned );
			return elStar;
		}

		                                                                                                      
		elStar.SetDialogVariableInt( 'mission_points_goal', 0 );
		elStar.SetDialogVariableInt( 'mission_points_earned', 0 );
		elStar.SetHasClass( 'op-mission-card__hide-count', true );
		return elStar;
	};

	var _CreateSectionCount = function( elContainer, oData, nEarnedDisplay )
	{
		var elSectionCount = null;
		if( !elContainer.FindChildInLayoutFile( 'id-section-count' ) )
		{
			elSectionCount = $.CreatePanel( 'Label', 
				elContainer, 
				'id-section-count', 
				{class: 'op_mission-card__mission-progress-count'} 
				);
		}
		else
		{
			elSectionCount = elContainer.FindChildInLayoutFile( 'id-section-count' );
		}

		elSectionCount.text = nEarnedDisplay +'/'+ oData.nGoal;
		return elSectionCount;
	}

	var _GetTotalPointsEarned = function( nUncommitedPoints, nEarned, nGoal, nPreviousGoal )
	{
		var earnedPoints = ( nEarned >= ( nGoal + nPreviousGoal )) ?
			nGoal : nEarned === 0 ?
			0 :
			nEarned + nPreviousGoal;
		
		return ( ( nUncommitedPoints > 0 ) && ( nUncommitedPoints + earnedPoints ) >= nGoal ) ? nGoal
			: ( nUncommitedPoints > 0 ) ? nUncommitedPoints + earnedPoints :
				earnedPoints;
	};

	var LoadSnippetByType = function ( elContainer, snippetPanelId, snippetName )
	{
		var elSnippet = null;
		
		if ( !elContainer.FindChildInLayoutFile( snippetPanelId ) )
		{
			elSnippet = $.CreatePanel( 'Panel',
				elContainer,
				snippetPanelId
			);
			
			elSnippet.BLoadLayoutSnippet( snippetName );
		}
		else
		{
			elSnippet = elContainer.FindChildInLayoutFile( snippetPanelId );
		}

		return elSnippet;
	}

	var _SetMissionOnActivate = function( missionCardId, MissionItemID, nSeasonAccess )
	{
		$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );

		if ( OperationUtil.IsMissionLockedBehindPremiumOperationPass( missionCardId, MissionItemID, nSeasonAccess ) )
		{
			var sFauxPassItemID = OperationUtil.GetPassFauxId();
			var sOperationPassName = ItemInfo.GetName( sFauxPassItemID );

			UiToolkitAPI.ShowGenericPopupYesNo( sOperationPassName,                                                           
					"#op_mission_requires_premium_pass", "",
					function() { OperationUtil.OpenUpSell(); },
					function() {} 
				);
			return;
		}

		                                                                                
		var gameMode = InventoryAPI.GetQuestGameMode( MissionItemID );
		if ( gameMode === 'competitive' )
		{
			var bModeUnlocked = MyPersonaAPI.HasPrestige() || ( MyPersonaAPI.GetCurrentLevel() >= 2 );
			if ( !bModeUnlocked )
			{
				                                                      
				                                                               

				UiToolkitAPI.ShowGenericPopupOk(
					"#PlayMenu_unavailable_locked_mode_title",
					"#PlayMenu_unavailable_newuser_2",
					"",
					function() {},
					function() {} 
				);
				return;
			}
		}

		UiToolkitAPI.ShowCustomLayoutPopupParameters( 
			'',
			'file://{resources}/layout/popups/popup_activate_mission.xml',
			'message=' + $.Localize( '#op_mission_activate' ) +
			'&' + 'requestedMissonCardId=' + missionCardId +
			'&' + 'seasonAccess=' + nSeasonAccess +
			'&' + 'questItemID=' + MissionItemID +
			'&' + 'spinner=1'
		);
	};

	var _ShowMissionTooltip = function ( elMission, oMissionDetails )
	{
		var submissionids = [];

		oMissionDetails.aSubQuests.forEach(element => {
			submissionids.push( element.missionId );
		});
		
		UiToolkitAPI.ShowCustomLayoutParametersTooltip( 
			elMission.id, 
			'TooltipMission', 
			'file://{resources}/layout/tooltips/tooltip_mission.xml',
			'type=' + oMissionDetails.missonType +
			'&' + 'gamemode=' + oMissionDetails.missionGameMode +
			'&' + 'mission-id=' + oMissionDetails.missionId +
			'&' + 'sub-mission-ids=' + submissionids.join(',')
			);
	}

	var _HideMissionTooltip = function()
	{
		UiToolkitAPI.HideCustomLayoutTooltip( 'TooltipMission' );
	}

	return {
		CreateMission: _CreateMission,
		UpdateMissionDisplay: _UpdateMissionDisplay,
		HudIncompleteSubMissions: _HudIncompleteSubMissions
	};
} )();