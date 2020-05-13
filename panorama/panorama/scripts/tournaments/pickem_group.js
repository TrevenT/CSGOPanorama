'use strict';

var PickEmGroup = ( function()
{
	                                                    
	                                                                                          
	                                                                                   
	                                                                                                     
	                                                                    

	var _Init = function ( elPanel )
	{
		                                                                            
		var oGroupData  = _MakeGroupDataObject( elPanel );
		elPanel._oGroupData = oGroupData;

		_SetPointsWorth( elPanel );
		_SetUpDragTargets( elPanel );
		_UpdateGroupPicks( elPanel );
	};

	var _UpdateGroupPicks = function( elPanel )
	{
		var oGroupData = elPanel._oGroupData;

		for ( var i = 0; i < oGroupData.pickscount; i++ )
		{
			var elPick = elPanel.FindChildInLayoutFile( 'id-pickem-pick' + i );
			var elItemImage = elPick.FindChildInLayoutFile( 'id-pick-itemimage' );

			var oItemIdData = PickemCommon.GetYourPicksItemIdData( 
				oGroupData.tournamentid, 
				oGroupData.listpicks[i].localid
			 );
			
			PickemCommon.UpdateImageForPick( 
				oItemIdData,
				elItemImage, 
				oGroupData.listpicks[i].localid 
			);

			PickemCommon.UpdateCorrectPickState(
				oGroupData,
				PredictionsAPI.GetGroupCorrectPicksByIndex( oGroupData.tournamentid, oGroupData.groupid, i ),
				oGroupData.listpicks[i].localid,
				elPick.FindChildInLayoutFile( 'id-pickem-points-for-pick' )
			);

			var notOwned = PickemCommon.ShowPickItemNotOwnedWarning(
				oGroupData,
				oItemIdData,
				elPick.FindChildInLayoutFile( 'id-pickem-not-owned' ),
				oGroupData.listpicks[i].localid 
			);
			
			oGroupData.listpicks[i].storedefindex = notOwned ? 
				PickemCommon.GetTeamItemDefIndex( oGroupData.listpicks[i].localid ):
				undefined;

			                                                              
			PickemCommon.UpdateRemoveBtn(
				elPanel,
				elPick.FindChildInLayoutFile( 'id-pick-cancelbtn' ),
				elPanel._oGroupData.listpicks[i].localid,
				_UpdateGroupPicks
			);

			elPick.SetHasClass( 'pickem-pick-placed', oGroupData.listpicks[i].localid ? true : false );
			elPick.SetHasClass( 'is-saved-pick', _IsPickSaved(elPanel._oGroupData.listpicks[i]) );

                                                                                      
                                                                                      
			_UpdateTeams( elPanel );
		}

		PickemCommon.UpdateActionBarBtns( elPanel );
	};

	var _HavePicksChanged = function( oGroupData )
	{
		for ( var i = 0; i < oGroupData.pickscount; i++ )
		{
			if( oGroupData.listpicks[i].localid !== oGroupData.listpicks[i].savedid  )
			{
				return true;
			}
		}
		return false;
	};

	var _IsPickSaved = function( oPick )
	{	
		if( ( oPick.localid === oPick.savedid ) && oPick.localid !== 0 && oPick.localid !== undefined )
		{
			return true;
		}

		return false;
	};

	var _MakeGroupDataObject = function( elPanel )
	{
		var tournamentId = elPanel._oData.tournamentid;
		var sectionId = PredictionsAPI.GetEventSectionIDByIndex( tournamentId , elPanel._oData.dayindex );
		var groupIds = PickemCommon.GetGroupIdsForSection( tournamentId, sectionId );
		var groupId = groupIds[0];
		var picksCount = PredictionsAPI.GetGroupPicksCount( tournamentId, groupId );
	
		                                                                  
		                                                                                  
		                                                                                             
		var aPicks = [];
		var aLocalPicks = [];
		for ( var i = 0; i < picksCount; i++ )
		{
			var userPickTeamID = PredictionsAPI.GetMyPredictionTeamID( tournamentId, groupId, i );
			
			                                                                                     
			                                            
			userPickTeamID = userPickTeamID === undefined ? 0 : userPickTeamID;
			aPicks.push( {
				savedid: userPickTeamID,
				localid: userPickTeamID,
				storedefindex: undefined,
			});
		}

		return {
			tournamentid : tournamentId,
			groupid: groupId,
			sectionid : sectionId,
			pickscount: picksCount,
			isdayactive: PredictionsAPI.GetSectionIsActive( tournamentId, sectionId ),
			groupcanpick: PredictionsAPI.GetGroupCanPick( tournamentId, groupId ),
			pickworth: PredictionsAPI.GetGroupPickWorth( tournamentId, groupId ),
			listpicks: aPicks
		};
	};

	var _SetPointsWorth = function( elPanel )
	{
		var elLabel = elPanel.FindChildInLayoutFile( 'id-pickem-group-worth' );
		var points = elPanel._oGroupData.pickworth;
		var pluralString = points === 1 ? $.Localize( '#pickem_point' ) : $.Localize( '#pickem_points' );

		elLabel.SetDialogVariableInt( 'points', points );
		elLabel.SetDialogVariable( 'plural', pluralString );
	};

	var _UpdateTeams = function( elPanel )
	{
		var groupId = elPanel._oGroupData.groupid;
		var tournamentId = elPanel._oGroupData.tournamentid;
		var teamCount = PredictionsAPI.GetGroupTeamsPickableCount( tournamentId, groupId );
		var elTeams = elPanel.FindChildInLayoutFile( 'id-pickem-groum-teams' );
		var isDayActive = elPanel._oGroupData.isdayactive;
		var groupCanPick = elPanel._oGroupData.groupcanpick;

		for ( var i = 0; i < teamCount; i++ )
		{
			var teamId = PredictionsAPI.GetGroupTeamIDByIndex( tournamentId, groupId, i );
			var uniqueId = elPanel._oGroupData.tournamentid + elPanel._oData.xmltype + teamId;
			var elTeam = elTeams.FindChildInLayoutFile( uniqueId );

            if ( !teamId )
            {
                return;
            }
            
            if ( !elTeam )
			{
				elTeam = _CreateTeam( elTeams, uniqueId, teamId );
			}

			var elLogoImage = elTeam.FindChildInLayoutFile( 'id-team-logo' );
			var szImageToUse = null;
			var yourItemId = PredictionsAPI.GetMyPredictionItemIDForTeamID( tournamentId, teamId );
			if ( !yourItemId || yourItemId === '0' || yourItemId === 0 )
			{
				szImageToUse = _GetTeamImage( elTeam );
				elLogoImage.AddClass( 'barelogo' );
			}
			else
			{
				szImageToUse = 'file://{images_econ}/'+InventoryAPI.GetItemInventoryImage( yourItemId )+'.png';
				elLogoImage.RemoveClass( 'barelogo' );
			}
			elLogoImage.SetImage( szImageToUse );

			var isAlreadyPicked = _SetIsAlreadyPicked( elPanel, elTeam );

			if( isDayActive && groupCanPick )
			{
				_SetUpDraggableEvents( elTeam, isAlreadyPicked );
			}
			else
			{
				elTeam.IsDraggable = false;
			}

			_TeamTooltips( elTeam );
		}
	};

	var _CreateTeam = function( elTeams, uniqueId, teamId )
	{
		var elTeam = $.CreatePanel( "Panel", elTeams, uniqueId );
		elTeam.BLoadLayoutSnippet( "team" );
		elTeam._teamid = teamId;

		return elTeam;
	};

	var _GetTeamImage = function( elTeam )
	{
		var teamTag = PredictionsAPI.GetTeamTag( elTeam._teamid );
		return 'file://{images}/tournaments/teams/' + teamTag + '.svg';
	};

	var _SetIsAlreadyPicked = function ( elPanel, elTeam )
	{
		var isAlreadyPick = PickemCommon.CheckIfTeamIsAlreadyPicked( elPanel._oGroupData, elTeam._teamid );
        var elUsed = elTeam.FindChildInLayoutFile( 'id-team-used' );
        elUsed.SetHasClass( 'hidden', !isAlreadyPick );

		return isAlreadyPick;
	};

	var _SetUpDraggableEvents = function( elTeam, isAlreadyPick )
	{
		if ( isAlreadyPick )
		{
			elTeam.IsDraggable = false;
			$.UnregisterEventHandler( 'DragStart', elTeam, elTeam._DragStartHandle );
			return;
		}
		
		elTeam.IsDraggable = true;

		if ( elTeam._DragStartHandle )
		{
			$.UnregisterEventHandler( 'DragStart', elTeam, elTeam._DragStartHandle );
		}
	
			elTeam._DragStartHandle = $.RegisterEventHandler( 'DragStart', elTeam, function( targetId, obj )
			{
				var elDraggable = $.CreatePanel( "Image", elTeam, 'draggable' + elTeam._teamid,
					{
						src: _GetTeamImage( elTeam ),
						class: 'pickem-team-draggable',
						textureheight: '128',
						texturewidth: '128'
					} );
				
				elDraggable._teamid = elTeam._teamid;

				obj.displayPanel = elDraggable;
				obj.removePositionBeforeDrop = false;
				elDraggable.AddClass( 'dragstart' );
			} );

			elTeam._DragEndHandle = $.RegisterEventHandler( 'DragEnd', elTeam, function( targetId, obj )
			{
				obj.AddClass( 'dragend' );
				obj.DeleteAsync( 0.25 );
			} );
	
	};

	var _TeamTooltips = function( elTeam )
	{
		var OnMouseOver = function ( elTeam )
		{
			UiToolkitAPI.ShowTextTooltip( elTeam.id, PredictionsAPI.GetTeamName( elTeam._teamid ) );

			if( elTeam.IsDraggable )
			{
				elTeam.AddClass('pickem-group-pick--wiggle');
			}
		};

		var OnMouseOut = function ( elTeam ) 
		{
			UiToolkitAPI.HideTextTooltip();
			elTeam.RemoveClass('pickem-group-pick--wiggle');
		};

		elTeam.SetPanelEvent( 'onmouseover', OnMouseOver.bind( undefined, elTeam ) );
		elTeam.SetPanelEvent( 'onmouseout', OnMouseOut.bind( undefined, elTeam ) );
	};

	var _SetUpDragTargets = function( elPanel )
	{
		var picksCount = PredictionsAPI.GetGroupPicksCount( elPanel._oGroupData.tournamentid, elPanel._oGroupData.groupid );

		var _DragEnter = function( elDragTarget )
		{
			elDragTarget.AddClass( 'dragenter' );

			                                                                                           
			elPanel._dragtarget = elDragTarget.GetParent();
		};

		var _DragLeave = function( elDragTarget )
		{
			elDragTarget.RemoveClass( 'dragenter' );
			elPanel._dragtarget = null;
		};

		for ( var i = 0; i < picksCount; i++ )
		{
			var elPick = elPanel.FindChildInLayoutFile( 'id-pickem-pick' + i );
			var elDragTarget= elPick.FindChildInLayoutFile( 'id-pick-boundingbox' );

			$.RegisterEventHandler(
				'DragEnter',
				elDragTarget,
				_DragEnter.bind( undefined, elDragTarget )
			);
			
			$.RegisterEventHandler(
				'DragLeave',
				elDragTarget,
				_DragLeave.bind( undefined, elDragTarget )
			);
		
			$.RegisterEventHandler(
				'DragDrop',
				elDragTarget,
				function( dispayId, elDisplay )
				{
					                                  
					                                      
					_PlaceTempPick( elPanel, elDisplay._teamid );
				}
			);
		}
	};

	var _PlaceTempPick = function( elPanel, teamid )
	{
		$.DispatchEvent( 'PlaySoundEffect', 'sticker_applySticker', 'MOUSE' );
		
		                                        
		var pickIndex = elPanel._dragtarget.GetAttributeString( 'data-pick-index', '' );

		if( pickIndex )
		{
			elPanel._oGroupData.listpicks[ Number( pickIndex ) ].localid = teamid;
		}

		_UpdateGroupPicks( elPanel );
	};

	var _UpdatePrediction = function( elPanel )
	{
		                                     

		var oGroupData = elPanel._oGroupData;

		                                                               
		for ( var i = 0; i < oGroupData.pickscount; i++ )
		{
			var elPick = elPanel.FindChildInLayoutFile( 'id-pickem-pick' + i );
			var userPickTeamID = PredictionsAPI.GetMyPredictionTeamID( oGroupData.tournamentid, oGroupData.groupid, i );
			oGroupData.listpicks[i].savedid = userPickTeamID;
				
			if( _IsPickSaved( oGroupData.listpicks[i] ))
			{
				elPick.FindChildInLayoutFile('id-pick-boundingbox').TriggerClass( 'pickem-group-pick-update' );
			}
		}

		_UpdateGroupPicks( elPanel );

	};
	
	var _PurchaseComplete = function( elPanel )
	{
		_UpdateGroupPicks( elPanel );
	}

	return{
		Init : _Init,
		UpdatePrediction : _UpdatePrediction,
		PurchaseComplete : _PurchaseComplete
	};
})();	

                                     
    
	                                                         
	                                                 

	                                                         

	                                                                          
	    
	                                                                   
	                                            
	       

	                                                                        
	    
	                                                                     
	                                              
	       


	                                                                     
	                                                                                                                            
	                                                                                                                            
	                                                                                                                                                      
     