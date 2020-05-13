'use strict';

var OperationUtil = ( function () {

	var m_nSeasonAccess = -1;
	var m_numTierUnlocked = 0;
	var m_numMissionsCompleted = 0;
	var m_numMissionsRewardThresholds = 0;
	var m_bPremiumUser = false;
	var m_nCoinRank = 0;
	var m_nActiveCardIndex = 0;
	var m_nRewardsCount = 0;
	var m_nLoopingRewardsCount = 0;
	var m_bPrime = false;

	var _ValidateOperationInfo = function( nSeasonAccess )
	{
		                                               
		                               
		                                                                          
		m_nSeasonAccess = nSeasonAccess
		
		if ( nSeasonAccess < 0 || nSeasonAccess === null )
			return false;
		
		m_nSeasonAccess = nSeasonAccess;
		                                                 

		m_nCoinRank = MyPersonaAPI.GetMyMedalRankByType( ( m_nSeasonAccess + 1 ) + "Operation$OperationCoin" );
		                                           

		                                                                                                                         
		var idxOperation = InventoryAPI.GetCacheTypeElementIndexByKey( 'SeasonalOperations', m_nSeasonAccess );
		if ( idxOperation != undefined && idxOperation != null
			&& InventoryAPI.GetCacheTypeElementFieldByIndex( 'SeasonalOperations', idxOperation, 'season_value' ) == m_nSeasonAccess )
		{	                                                         
			m_numMissionsCompleted = InventoryAPI.GetCacheTypeElementFieldByIndex( 'SeasonalOperations', idxOperation, 'missions_completed' );
			m_numTierUnlocked = InventoryAPI.GetCacheTypeElementFieldByIndex( 'SeasonalOperations', idxOperation, 'tier_unlocked' );
			m_bPremiumUser = ( InventoryAPI.GetCacheTypeElementFieldByIndex( 'SeasonalOperations', idxOperation, 'premium_tiers' ) >= 1 ) ? true : false;
			m_nActiveCardIndex = MissionsAPI.GetSeasonalOperationMissionCardActiveIdx( m_nSeasonAccess );
		}
		else
		{
			                                             

			m_numMissionsCompleted = 0;
			m_numTierUnlocked = 0;
			m_bPremiumUser = false;
			m_nActiveCardIndex = -1;
		}

		m_bPrime = PartyListAPI.GetFriendPrimeEligible( MyPersonaAPI.GetXuid() );
		m_nRewardsCount = MissionsAPI.GetSeasonalOperationTrackRewardsCount( m_nSeasonAccess );
		m_nLoopingRewardsCount = MissionsAPI.GetSeasonalOperationLoopingRewardsCount( m_nSeasonAccess );
		m_numMissionsRewardThresholds = MissionsAPI.GetSeasonalOperationXpRewardsThresholds( m_nSeasonAccess );
		_AddLoopingRewardsToDisplay();

		                                                 
		                                                            
		                                                          
		                                                  
		                                         
		                                 

		return true;
	};

	var _AddLoopingRewardsToDisplay = function()
	{
		                                    
		if ( m_nLoopingRewardsCount > 0 )
		{	                                                
			m_nRewardsCount += m_nLoopingRewardsCount;
			                                                                        
			while ( m_numTierUnlocked > m_nRewardsCount - m_nLoopingRewardsCount )
			{
				m_nRewardsCount += m_nLoopingRewardsCount;
			}
		}
	};

	var _GetRewardsData = function()
	{
		                                    
		if ( !m_nSeasonAccess || m_nSeasonAccess === -1 )
		{
			return;
		}
		
		var _allRewardsData = [];
		for ( var i = 0; i < m_nRewardsCount; i++ )
		{
			                                                                                                                                  
			                                                                                                                 
			                                                                             
			                                                                                                           
			                                              
			var _rewardsData = {};
			_rewardsData.idx = i;
			var ui_order = MissionsAPI.GetSeasonalOperationTrackRewardSchema( m_nSeasonAccess, i, "ui_order" );
			_rewardsData.uiOrder = ui_order ? ui_order : '';
			_rewardsData.useAsCallout = _rewardsData.useInShortcutList ? $.Localize( MissionsAPI.GetSeasonalOperationTrackRewardSchema( m_nSeasonAccess, i, "callout" ) ) : '';
			_rewardsData.isGap = MissionsAPI.GetSeasonalOperationTrackRewardSchema( m_nSeasonAccess, i, "none" );
			_rewardsData.isUnlocked = i < m_numTierUnlocked;
			_rewardsData.imagePath = MissionsAPI.GetSeasonalOperationTrackRewardSchema( m_nSeasonAccess, i, "ui_image" );
			_rewardsData.imagePathThumbnail = MissionsAPI.GetSeasonalOperationTrackRewardSchema( m_nSeasonAccess, i, "ui_image_thumbnail" );
			_rewardsData.imagePathInspect = MissionsAPI.GetSeasonalOperationTrackRewardSchema( m_nSeasonAccess, i, "ui_image_inspect" );

			var sFreeRewardName = MissionsAPI.GetSeasonalOperationTrackRewardSchema( m_nSeasonAccess, i, "item_name_free" );
			var sRewardName = MissionsAPI.GetSeasonalOperationTrackRewardSchema( m_nSeasonAccess, i, "item_name" );
			var rewardTypes = [
				{ type: 'premium', names: sRewardName },
				{ type: 'free', names: sFreeRewardName }
			];
		
			rewardTypes.forEach( rType =>
			{
				var items = { type: rType.type, ids: [] };
				var nameList = rType.names.split( ',' );
				nameList.forEach( reward =>
				{
					if ( reward )
					{
						var itemidForReward;
						if ( reward.startsWith( 'lootlist:' ) )
						{                                               
							itemidForReward = InventoryAPI.GetLootListItemIdByIndex( reward, 0 );
						} else
						{	                                                  
							var nDefinitionIndex = InventoryAPI.GetItemDefinitionIndexFromDefinitionName( reward );
							itemidForReward = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( nDefinitionIndex, 0 );
						}
						items.ids.push( itemidForReward );
					}
				} );
					
				_rewardsData[ 'item' + rType.type ] = items;
			} );
			
			_allRewardsData.push( _rewardsData );
		}

		return _allRewardsData;
	};

	var _GetLootListForReward = function( rewardId )
	{
		var count = ItemInfo.GetLootListCount( rewardId );
		var itemsList = [];
		if ( !count )
		{
			itemsList.push( rewardId );
		}
		else
		{
			for ( var i = 0; i < count; i++ )
			{
				itemsList.push( ItemInfo.GetLootListItemByIndex( rewardId, i ) );
			}
		}

		return itemsList;
	};

	function _OpenPopupCustomLayoutOperationHub ( rewardIdxToSetWhenOpen )
	{
		var nActiveSeason = GameTypesAPI.GetActiveSeasionIndexValue();
		if ( nActiveSeason < 0 )
			return;

		var elPanel = UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/operation/operation_main.xml',
			'none'
		);
		$.DispatchEvent( 'PlaySoundEffect', 'tab_mainmenu_inventory', 'MOUSE' );

		elPanel.SetAttributeInt( "season_access", nActiveSeason );
		if ( rewardIdxToSetWhenOpen > -1 )
		{
			elPanel.SetAttributeInt( "start_reward", rewardIdxToSetWhenOpen );
		}
	}

	function _OpenUpSell( starsNeeded = 0 )
	{
		function _OpenStarStore()
		{
			var elPopup = UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/popups/popup_operation_store.xml',
				'bluroperationpanel=true',
				'none'
			);

			elPopup.SetAttributeInt( "starsneeded", starsNeeded );
			                                                              
			
			var oOldStarsActivate = _UpdateOldStars();
			if ( oOldStarsActivate.ids.length > 0 )
			{
				elPopup.SetAttributeString( "oldstarstoactivate", oOldStarsActivate.ids.join( ',' ) );
				elPopup.SetAttributeInt( "oldstarstoactivatevalue", oOldStarsActivate.value );
			}
		}

		function _OpenStoreForPass()
		{
			var passId = InventoryAPI.GetActiveSeasonPassItemId();

			if( passId )
			{
				UiToolkitAPI.ShowCustomLayoutPopupParameters(
					'',
					'file://{resources}/layout/popups/popup_inventory_inspect.xml',
					'itemid=' + passId +
					'&' + 'asyncworktype=useitem' + 
					'&' + 'seasonpass=true' +
					'&' + 'bluroperationpanel=true'
				);
				return;
			}
			
			var passDefIndex = _GetPassFauxId();
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/popups/popup_inventory_inspect.xml',
				'itemid=' + passDefIndex +
				'&' + 'inspectonly=false' +
				'&' + 'asyncworkitemwarning=no' +
				'&' + 'bluroperationpanel=true' +
				'&' + 'storeitemid=' + passDefIndex +
				'&' + 'overridepurchasemultiple=0',
				'none'
			);

			                                                               
			                                                    
			var nSourceLayoutId = 0;
			var strSourceLayoutFile = $.GetContextPanel().layoutfile;
			if ( strSourceLayoutFile.endsWith( "operation_mainmenu.xml" ) )
			{
				nSourceLayoutId = 1; 
			}
			else if ( strSourceLayoutFile.endsWith( "operation_main.xml" ) )
			{
				nSourceLayoutId = 2; 
			}
			StoreAPI.RecordUIEvent( "OperationJournal_Purchase", nSourceLayoutId );
		}

		$.DispatchEvent( 'PlaySoundEffect', 'tab_mainmenu_inventory', 'MOUSE' );

		if ( m_bPremiumUser )
		{
			_OpenStarStore();
		}
		else
		{
			_OpenStoreForPass();
		}
	}

	var _GetPassFauxId = function()
	{
		return  InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( '4549', 0 );
	}

	var _GetOperationStarDefIdxArray = function()
	{
		return [ 4671, 4672, 4673 ];
	}

	var _UpdateOldStars = function()
	{
		var oDefNames = [
			{ def:'CommunitySeasonNine2019_PlusStars1', value: 1 },
			{ def:'CommunitySeasonNine2019_PlusStars10', value: 10 },
			{ def:'CommunitySeasonNine2019_PlusStars100', value: 100 }
		];

		var oTotalStars = { ids: [], value: 0 };
		oDefNames.forEach( element =>
		{
			InventoryAPI.SetInventorySortAndFilters( 'inv_sort_age', false, 'item_definition:' + element.def, '', '' );
			var count = InventoryAPI.GetInventoryCount();
			for ( var i = 0; i < count; i++ )
			{
				oTotalStars.ids.push( InventoryAPI.GetInventoryItemIDByIndex( i ) );
				oTotalStars.value += element.value;
			}
		} );

		return oTotalStars;
	};
	
	var gameElementDetails = {
		exojump: {
			icon: "file://{images}/icons/ui/exojump_hud.svg",
			name: "Survival_SpawnEquip_exojump",
			tooltip: ""
		},
		breachcharge: {
			icon: "file://{images}/icons/equipment/breachcharge.svg",
			name: "SFUI_WPNHUD_BreachCharge",
			tooltip: ""
		},
		parachute: {
			icon: "file://{images}/icons/ui/parachute.svg",
			name: "Survival_SpawnEquip_parachute",
			tooltip: ""
		},
		bumpmine: {
			icon: "file://{images}/icons/equipment/bumpmine.svg",
			name: "SFUI_WPNHUD_BumpMine",
			tooltip: ""
		},
	};

	                                                                                           
	var _GetQuestGameElements = function( questID )
	{
		return MissionsAPI.GetQuestGameElements( questID ).map( elem => gameElementDetails[ elem ] );
	};

	var _GetOperationInfo = function()
	{
		return {
			nSeasonAccess: m_nSeasonAccess,
			nTierUnlocked: m_numTierUnlocked,
			nRewardsCount: m_nRewardsCount,
			nMissionsCompleted: m_numMissionsCompleted,
			numMissionsRewardThresholds: m_numMissionsRewardThresholds,
			bPremiumUser: m_bPremiumUser,
			nCoinRank: m_nCoinRank,
			nActiveCardIndex: m_nActiveCardIndex,
			bPrime: m_bPrime
		};
	};

	return {
		ValidateOperationInfo: _ValidateOperationInfo,
		GetOperationInfo: _GetOperationInfo,
		GetRewardsData: _GetRewardsData,
		GetLootListForReward: _GetLootListForReward,
		OpenPopupCustomLayoutOperationHub: _OpenPopupCustomLayoutOperationHub,
		OpenUpSell: _OpenUpSell,
		GetQuestGameElements: _GetQuestGameElements,
		UpdateOldStars: _UpdateOldStars,
		GetPassFauxId: _GetPassFauxId,
		GetOperationStarDefIdxArray: _GetOperationStarDefIdxArray
	};

})();
