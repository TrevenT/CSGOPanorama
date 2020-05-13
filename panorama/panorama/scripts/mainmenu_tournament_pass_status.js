"use strict";

var MainMenuTournamentPassStatus = ( function() {
	var _Init = function()
	{
		if ( !MyPersonaAPI.IsConnectedToGC() )
		{
			return;
		}
		
		$.GetContextPanel().SetHasClass( 'hidden',false );
		_SetImage();
	};

	var _SetImage = function()
	{
		var elImage = $.GetContextPanel().FindChildInLayoutFile('id-tournament-pass-status-image');
		var elLabel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-pass-status-header' );
		var title = '';
		var elDescLabel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-pass-status-game-countdown' );
		var onActivate = null;

		                                                                                                
		var id = InventoryAPI.GetActiveTournamentCoinItemId( g_ActiveTournamentInfo.eventid );
		var elPrecent = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-pass-saletag' );
		elPrecent.SetHasClass( 'hidden', true );
			
		if( !id || id === '0' )
		{
			elDescLabel.SetHasClass( 'hidden', false );

			                                                              
			id = InventoryAPI.GetActiveTournamentCoinItemId( g_ActiveTournamentInfo.eventid * -1 );
			if ( !id || id === '0' )
			{
				                                                               
				id = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( g_ActiveTournamentInfo.itemid_pass, 0 );
				if ( !StoreAPI.GetStoreItemSalePrice( id, 1, '' ) )
				{
					$.GetContextPanel().SetHasClass( 'hidden', true );
					return;
				}
				
				                                                
				onActivate = _ShowInpsectPopup;
				title = InventoryAPI.GetItemName( id );

				                 
				var reduction = ItemInfo.GetStoreSalePercentReduction( g_ActiveTournamentInfo.itemid_pass, 1 );
				elPrecent.SetHasClass( 'hidden', ( reduction === '' || reduction === undefined ) ? true : false );
				elPrecent.text = reduction;

				if ( !reduction )
				{
					elDescLabel.text = "#CSGO_TournamentPass_katowice2019_Desc_short";
				}
				else
				{
					EnableCountdownTimer( elDescLabel );
				}
			}
			else
			{
				onActivate = _ActivatePass;
				elDescLabel.text = "#SFUI_ConfirmBtn_ActivatePassNow";
				title = InventoryAPI.GetItemName( id );
			}
			
			elImage.SetHasClass( 'pass', true );

			$.GetContextPanel().style.backgroundImage = 'url("file://{images}/backgrounds/tournament_pass_bg_' + g_ActiveTournamentInfo.eventid + '.png")';
			$.GetContextPanel().style.backgroundRepeat = 'no-repeat';
			$.GetContextPanel().style.backgroundSize = '100% 250%';
			$.GetContextPanel().style.backgroundPosition = '50% 0%';
		}
		else
		{
			                  
			elImage.SetHasClass( 'pass', false );
			EnableCountdownTimer( elDescLabel );

			$.GetContextPanel().style.backgroundImage = 'url( "file://{resources}/videos/tournament_bg540p.webm" )';
			$.GetContextPanel().style.backgroundRepeat = 'no-repeat';
			$.GetContextPanel().style.backgroundSize = 'cover';
			$.GetContextPanel().style.backgroundPosition = '50% 25%';

			onActivate = _ShowTournamentJournalPanel;
			title = InventoryAPI.GetItemName( id );
		}

		elLabel.text = title;
		elImage.itemid = id;
		$.GetContextPanel().FindChildInLayoutFile('id-tournament-pass-status').SetPanelEvent(
			'onactivate', onActivate.bind(undefined, id)
		);
	};

	var EnableCountdownTimer = function( elDescLabel )
	{
		var elPanel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-pass-status' );

		elDescLabel.text = "#pickem_timer";
		$.Schedule( 0.1, _Timer.bind( undefined, elPanel ) );
	};

	var _ShowInpsectPopup = function( id )
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_inventory_inspect.xml',
			'itemid=' + id
			+ '&' +
			'inspectonly=false'
			+ '&' +
			'asyncworkitemwarning=no'
			+ '&' +
			'storeitemid=' + id,
			'none'
		);
	};

	var _ShowTournamentJournalPanel = function ( id )
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_tournament_journal.xml',
			'journalid=' + id
		);
	};

	var _ActivatePass = function ( id )
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_capability_decodable.xml',
			'key-and-case=,' + id +
			'&' + 'asyncworktype=decodeable'
		);
	};

	var _Timer = function( elPanelParam )
	{
		                                    
		if ( !elPanelParam || !elPanelParam.IsValid() )
			return;

		var elCountdown = elPanelParam.FindChildInLayoutFile( 'id-tournament-pass-status-game-countdown' );
		var secRemaining = PredictionsAPI.GetGroupRemainingPredictionSeconds( "global" );
		if ( !secRemaining )
		{
			_ShowStatus( elPanelParam );
			return;
		}

		elCountdown.SetDialogVariable( 'time', FormatText.SecondsToSignificantTimeString( secRemaining ) );
		elCountdown.SetHasClass( 'hidden', ( secRemaining > 0 ) ? false : true );
		$.Schedule( 30, _Timer.bind( null, elPanelParam ) );
	};

	var _ShowStatus = function( elPanel )
	{
		var id = InventoryAPI.GetActiveTournamentCoinItemId( g_ActiveTournamentInfo.eventid );
		var nCampaignID = parseInt( InventoryAPI.GetItemAttributeValue( id, "campaign id" ) );
		var numTotalChallenges = InventoryAPI.GetCampaignNodeCount( nCampaignID );

		var completedChallengesList = [];
		for ( var jj = 0; jj < numTotalChallenges; ++jj )
		{
			var nMissionNodeID = InventoryAPI.GetCampaignNodeIDbyIndex( nCampaignID, jj );
			var strNodeState = InventoryAPI.GetCampaignNodeState( nCampaignID, nMissionNodeID, id );

			if ( strNodeState === "complete" )
			{
				completedChallengesList.push(nMissionNodeID);
			}
		}

		var completedChallenges = completedChallengesList.length;
		var elLabel = elPanel.FindChildInLayoutFile( 'id-tournament-pass-status-game-countdown' );

		elLabel.SetHasClass( 'hidden', ( !completedChallenges || completedChallenges < 1 ) );
		
		if ( !completedChallenges || completedChallenges < 1 )
		{
			return;
		}
	
		elLabel.SetDialogVariableInt( 'challenges', completedChallenges );
		elLabel.text = $.Localize( '#tournament_coin_completed_challenges_int', elLabel );
	};

	var _PurchaseComplete = function( id )
	{
		if ( ItemInfo.ItemDefinitionNameSubstrMatch(id, 'tournament_pass_') )
		{
			_Init();
		}
	};

	return{
		Init: _Init,
		PurchaseComplete: _PurchaseComplete
	};

})();

(function ()
{
	MainMenuTournamentPassStatus.Init();
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_UpdateConnectionToGC', MainMenuTournamentPassStatus.Init );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Store_PurchaseCompleted', MainMenuTournamentPassStatus.PurchaseComplete );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', MainMenuTournamentPassStatus.Init );
})();
