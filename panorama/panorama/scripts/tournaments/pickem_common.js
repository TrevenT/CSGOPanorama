                                                          

                                           
                                                                                         
                                                                                        
                                                                                        
                                                                                                          
                                                                                                                   

                                                                          
                                                                                 
                                                                                 
                                                                               

                                                                               
                                                                                       
                                                                                          
                                                                                            
                                                                                                    
                                                                                               

                                                                             
                                                                             
                                                                                 
                                                                                
                                                                                          
                                                                                                                                           

                                                                                         
                                                                                                     

                                                                                      
                                                                               
                                                                                         
                                                                                                                 
                                                                                             
                                                                                             
                                                                                                                                                                                                                

                                          
                                          
                                         

                                        
'use strict';

var PickemCommon = ( function()
{
	var _Init = function( elPanel )
	{
		elPanel._timerhandle = null;
		_IsDataLoaded( elPanel );
	};

	var _RefreshData = function( elPanel )
	{
		_IsDataLoaded( elPanel );
	};

	var _IsDataLoaded = function( elPanel )
	{
		                                       
		                       
		                             
		                                   
		var listState = MatchListAPI.GetState( elPanel._oData.tournamentid  );
		var elLoadingStatus = elPanel.FindChildInLayoutFile( 'id-pickem-loading-status' );
		var elPickemContent = elPanel.FindChildInLayoutFile( 'id-pickem-content' );
		_DefaultActionBarBtnsState(elPanel);

		if ( listState === 'none' )
        {
			MatchListAPI.Refresh( elPanel._oData.tournamentid  );
			
			_CancelMatchStatsLoadedTimeout( elPanel );
			elPanel._timerhandle = $.Schedule( 5, _MatchStatsLoadedTimeout.bind( undefined, elPanel ) );

			elLoadingStatus.visible = true;
			elPickemContent.visible = false;

			_UpdateLoadingStatusMessage( elPanel, $.Localize( '#CSGO_Watch_Loading_PickEm' ), true );
			return false;
		}
		else if ( listState === 'ready' )
		{
			var isLoaded = PredictionsAPI.GetMyPredictionsLoaded( elPanel._oData.tournamentid );
			var sectionsCount = PredictionsAPI.GetEventSectionsCount( elPanel._oData.tournamentid );
		
			if ( !isLoaded || !sectionsCount || elPanel._oData.dayindex === -1 )
			{
				_CancelMatchStatsLoadedTimeout( elPanel );
				elPanel._timerhandle = $.Schedule( 5, _MatchStatsLoadedTimeout.bind( undefined, elPanel ) );
				
				return false;
			}

			_CancelMatchStatsLoadedTimeout( elPanel );

			                                                                   
			                                                                        
			elPanel._oData.oPickemType.Init( elPanel );
			PickEmInfoBar.Init( elPanel );
			elLoadingStatus.visible = false;
			elPickemContent.visible = true;
			return true;
		}
	};

	var _MatchStatsLoadedTimeout = function( elPanel )
	{
		elPanel._timerhandle = null;
		_UpdateLoadingStatusMessage( elPanel, $.Localize( '#pickem_apply_timeout' ), false );
	};

	var _CancelMatchStatsLoadedTimeout = function( elPanel )
	{
		if ( elPanel._timerHandle )
		{
			$.CancelScheduled( elPanel._timerHandle );
			elPanel._timerHandle = null;
		}
	};

	var _UpdateLoadingStatusMessage = function( elPanel, messageText, showSpinner )
	{
		var elLoadingStatus = elPanel.FindChildInLayoutFile( 'id-pickem-loading-status' );
		elLoadingStatus.FindChildInLayoutFile( 'Message' ).text = messageText;

		var elLoadingStatus = elPanel.FindChildInLayoutFile( 'id-pickem-loading-status' );
		elLoadingStatus.FindChildInLayoutFile( 'Spinner' ).visible = showSpinner;
	};

	var _ReadyForDisplay = function( elPanel )
	{
		elPanel._eventhandle = $.RegisterForUnhandledEvent(
			'PanoramaComponent_MatchList_StateChange',
			_RefreshData.bind( undefined, elPanel )
		);
		
		                                                                   
		                                                                        
		elPanel._eventhandleprediction = $.RegisterForUnhandledEvent( 
			'PanoramaComponent_MatchList_PredictionUploaded', 
			elPanel._oData.oPickemType.UpdatePrediction.bind( undefined, elPanel )
		);

		elPanel._eventhandleinventoryUpdate = $.RegisterForUnhandledEvent( 
			'PanoramaComponent_Store_PurchaseCompleted', 
			elPanel._oData.oPickemType.PurchaseComplete.bind( undefined, elPanel )
		);


		if( PredictionsAPI.GetMyPredictionsLoaded( elPanel._oData.tournamentid ) )
		{
			elPanel._oData.oPickemType.UpdatePrediction( elPanel );
		}
	};

	var _UnreadyForDisplay = function( elPanel )
	{
		$.UnregisterForUnhandledEvent('PanoramaComponent_MatchList_StateChange', elPanel._eventhandle );
		$.UnregisterForUnhandledEvent('PanoramaComponent_MatchList_PredictionUploaded', elPanel._eventhandleprediction );
		$.UnregisterForUnhandledEvent('PanoramaComponent_Store_PurchaseCompleted', elPanel._eventhandleinventoryUpdate );
	};

	var _GetGroupIdsForSection = function( tournamentId, sectionId )
	{
		var groupCount = PredictionsAPI.GetSectionGroupsCount( tournamentId, sectionId );
		var listGroupIds = [];

		for( var i = 0; i < groupCount; i++ )
		{
			listGroupIds.push( PredictionsAPI.GetSectionGroupIDByIndex( tournamentId , sectionId, i ));
		}

		return listGroupIds;
	};

	var _UpdateImageForPick = function( oItemIdData, elItemImage, localTeamId )
	{
		var bValidTeamID = localTeamId ? ( oItemIdData.itemid ? true : false ) : false;

		if ( bValidTeamID )
		{
			elItemImage.itemid = oItemIdData.itemid;
		}

		elItemImage.SetHasClass( 'hidden', !bValidTeamID );
	};

	var _UpdateCorrectPickState = function ( oGroupData, correctPicks, localTeamId, elPointsEarned )
	{
		if ( correctPicks )
		{
			var isCorrect = _CheckIfPickIsCorrect( correctPicks, localTeamId );
			elPointsEarned.SetHasClass( 'hidden', !isCorrect );

			if ( isCorrect )
			{
				var pluralString = oGroupData.pickworth === 1 ? $.Localize( '#pickem_point' ) : $.Localize( '#pickem_points' );
				elPointsEarned.SetDialogVariableInt( 'points', oGroupData.pickworth );
				elPointsEarned.SetDialogVariable( 'plural', pluralString );
			}
		}
	};

	var _ShowPickItemNotOwnedWarning = function( oGroupData, oItemIdData, elItemNotOwned, localTeamId )
	{
		if( oGroupData.isdayactive && oGroupData.groupcanpick && localTeamId )
		{
			if( oItemIdData.type === 'fakeitem' )
			{
				elItemNotOwned.RemoveClass( 'hidden' );
				return true;
			}
		}

		elItemNotOwned.AddClass( 'hidden' );
		return false;
	};

	var _GetTeamItemDefIndex = function( teamId )
	{
		var team = g_ActiveTournamentTeams.filter( team => team.teamid === teamId );
		return team[0].itemid_sticker;
	};

	var _UpdateRemoveBtn = function ( elPanel, elRemoveButton, localTeamId, funcCallback )
	{
		var showRemoveBtn = ( elPanel._oGroupData.isdayactive && elPanel._oGroupData.groupcanpick && localTeamId ) ? true : false;
		elRemoveButton.SetHasClass( 'hidden', !showRemoveBtn );

		if( showRemoveBtn )
		{
			elRemoveButton.SetPanelEvent( 'onactivate', _RemovePick.bind( undefined, elPanel, funcCallback, localTeamId ) );
		}
	};

	var _RemovePick = function ( elPanel, funcCallback, localTeamId )
	{
		$.DispatchEvent( 'PlaySoundEffect', 'sticker_applySticker', 'MOUSE' );

		for( var i = 0; i < elPanel._oGroupData.listpicks.length; i++ )
		{
			if ( elPanel._oGroupData.listpicks[i].localid === localTeamId )
			{
				elPanel._oGroupData.listpicks[i].localid = 0;
			}
		}

		funcCallback( elPanel );
	};

	var _CheckIfPickIsCorrect = function( correctPicks, userPickTeamID )
	{
		var aCorrectPicks = correctPicks.split( ',' );
		var correctPicksCount = aCorrectPicks.length;

		for ( var i = 0; i < correctPicksCount; i++ )
		{
			if ( aCorrectPicks[ i ] === userPickTeamID.toString() )
			{
				return true;
			}
		}

		return false;
	};

	var _GetYourPicksItemIdData = function( tournamentId, userPickTeamID )
	{
		var yourItemId = PredictionsAPI.GetMyPredictionItemIDForTeamID( tournamentId, userPickTeamID );

		                                                                                             
		if ( !yourItemId || yourItemId === '0' || yourItemId === 0 )
		{
			yourItemId = PredictionsAPI.GetFakeItemIDToRepresentTeamID( tournamentId, userPickTeamID );
			return { type:'fakeitem', itemid:yourItemId };
		}
		
		return { type:'owneditem', itemid:yourItemId };
	};

	var _GetTournamentIdNumFromString = function( tournament_id )
	{
		return Number( tournament_id.split( ':' )[ 1 ] );
	};

	var _CheckIfTeamIsAlreadyPicked = function ( oGroupData, teamIdToCompare )
	{		
		for ( var i = 0; i < oGroupData.pickscount; i++)
		{	
			if ( oGroupData.listpicks[i].localid === teamIdToCompare )
			{
				return true;
			}
		}
	
		return false;
	};
	
	var _DefaultActionBarBtnsState = function(elPanel)
	{
		var elPurchase = elPanel.FindChildInLayoutFile( 'id-pickem-getitems' );
		var elApply = elPanel.FindChildInLayoutFile( 'id-pickem-apply' );
		elPurchase.visible = false;
		elApply.visible = false;
	};

	var _UpdateActionBarBtns = function( elPanel )
	{
		var elPurchase = elPanel.FindChildInLayoutFile( 'id-pickem-getitems' );
		var listStoreIndex = _GetListOfPicksWithNoOwnedItems( elPanel );
		var bShow = listStoreIndex.length > 0;
		if( elPurchase.visible !== bShow )
			elPurchase.TriggerClass( 'popup-capability-update-anim' );

		elPurchase.visible = bShow;
		_MouseOverEventsWithStickersToPurchase( elPurchase, 'id-pickem-getitems', listStoreIndex );
		_EventsForPurchaseBtn( elPurchase, listStoreIndex );

		var elApplyPicks = elPanel.FindChildInLayoutFile( 'id-pickem-apply' );
		var bEnable = _EnableApply( elPanel );
		elApplyPicks.visible = true;
		elApplyPicks.SetHasClass( 'loop', bEnable );
		
		if( elApplyPicks.enabled !== bEnable )
			elApplyPicks.TriggerClass( 'popup-capability-update-anim' );

		                                                                                               
		                                    

		elApplyPicks.enabled = bEnable;
		_EventsForApplyBtn( elPanel, elApplyPicks );
		_MouseOverEventsWithStickersToPurchase( elApplyPicks, 'id-pickem-apply', listStoreIndex );
	};

	var _GetListOfPicksWithNoOwnedItems = function( elPanel)
	{
		return elPanel._oGroupData.listpicks.filter( index => index.storedefindex !== undefined );
	}

	var _MouseOverEventsWithStickersToPurchase = function( elButton, btnid, listStoreIndex )
	{
		var _OnMouseOver = function( listStoreIndex )
		{
			var num = 0;
			var names = $.Localize( '#pickem_get_items_tooltip' );
			listStoreIndex.forEach( element => {
				var itemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( element.storedefindex, 0 );
				names = names + InventoryAPI.GetItemName( itemId ) + '<br>';
				++ num;
			});

			if ( num > 0 )
			{
				UiToolkitAPI.ShowTextTooltip( btnid, names );
			}
		};
	
		elButton.SetPanelEvent( 'onmouseover', _OnMouseOver.bind( undefined, listStoreIndex) );
		elButton.SetPanelEvent( 'onmouseout', function(){ UiToolkitAPI.HideTextTooltip(); });
	}

	var _EventsForPurchaseBtn = function( elPurchase, listStoreIndex )
	{		
		var _OnActivatePurchase = function( listStoreIndex )
		{
			var aList = [];
			listStoreIndex.forEach( element => {
				aList.push( element.storedefindex );
			});

			var purchaseString = aList.join( ',' );
			StoreAPI.StoreItemPurchase( purchaseString );
		};

		elPurchase.SetPanelEvent( 'onactivate', _OnActivatePurchase.bind( undefined, listStoreIndex ));
	}

	var _EnableApply = function( elPanel)
	{
		var picks = elPanel._oGroupData.listpicks;
	
		for ( var i = 0; i < elPanel._oGroupData.pickscount; i++ )
		{
			if ( !picks[i].storedefindex )
			{	                                                                  
				var idLocal = picks[i].localid;
				var idSaved = picks[i].savedid;
				if ( !idLocal ) idLocal = 0;
				if ( !idSaved ) idSaved = 0;
				if( idLocal !== idSaved )
				{
					                                                                                                               
					return true;
				}
			}
		}

		return false;
	};

	var _EventsForApplyBtn = function( elPanel, elApplyBtn )
	{
		var _OnApplyPicks = function( elPanel, elApplyBtn)
		{
			var tournamentId = elPanel._oGroupData.tournamentid;
			var count = elPanel._oGroupData.pickscount;
			var args = [ "tournament:14" ];
			var groupId = elPanel._oGroupData.groupid;
			var listPicks = elPanel._oGroupData.listpicks;
			var idsForDisplayInConfimPopup = [];

			for ( var i = 0; i < count; ++ i )
			{                                                                             
				var pickInGroupIndex = i;           
				var strStickerItemId = '';

				if ( listPicks[i].localid )
				{
					                                                    
					var oItemIdData = _GetYourPicksItemIdData( tournamentId, listPicks[i].localid );
					strStickerItemId = oItemIdData.type === 'fakeitem' ? '' : oItemIdData.itemid;

					if ( strStickerItemId )
					{
						idsForDisplayInConfimPopup.push( strStickerItemId );
					}
				}

				args.push( groupId, pickInGroupIndex, strStickerItemId );                              
			}

			var popup = UiToolkitAPI.ShowCustomLayoutPopupParameters( 
				'', 
				'file://{resources}/layout/popups/popup_confirm_picks.xml',
				'none'
			);

			var list = _GetListOfPicksWithNoOwnedItems( elPanel );
			var alistTeams = [];
			list.forEach(element => {
				alistTeams.push( element.localid );
			});

			                                       
			popup._args = args;
			popup._picksforconfirm = idsForDisplayInConfimPopup;
			popup._picksnoitems = alistTeams;
		};

		elApplyBtn.SetPanelEvent( 'onactivate', _OnApplyPicks.bind( undefined,elPanel, elApplyBtn ) );
	};
	
	return {
		Init: _Init,
		ReadyForDisplay: _ReadyForDisplay,
		RefreshData: _RefreshData,
		UnreadyForDisplay: _UnreadyForDisplay,
		GetGroupIdsForSection: _GetGroupIdsForSection,
		GetTournamentIdNumFromString: _GetTournamentIdNumFromString,
		CheckIfTeamIsAlreadyPicked: _CheckIfTeamIsAlreadyPicked,
		UpdateImageForPick: _UpdateImageForPick,
		UpdateCorrectPickState : _UpdateCorrectPickState,
		ShowPickItemNotOwnedWarning : _ShowPickItemNotOwnedWarning,
		UpdateRemoveBtn: _UpdateRemoveBtn,
		UpdateActionBarBtns: _UpdateActionBarBtns,
		GetTeamItemDefIndex : _GetTeamItemDefIndex,
		GetYourPicksItemIdData : _GetYourPicksItemIdData
	};

} )();

( function()
{
	                                                                                                   
} )(); 