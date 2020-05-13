'use strict';

var TournamentJournal = ( function()
{
    var m_test_challenges = [
                                                                                                                                    
    ];

                                                                                         
                                                                                                                            
                                                         
                                                                                                                                   
    var m_activeTournament = 17;
    var m_tokenItemDefName = null;
    var m_scheduleHandle = null;

    var m_isInMatch = GameStateAPI.IsDemoOrHltv() || GameStateAPI.IsLocalPlayerPlayingMatch(); 

    var _Init = function()
    {
        var journalId = $.GetContextPanel().GetAttributeString( "journalid", '' );
        var tournamentId = InventoryAPI.GetItemAttributeValue( journalId, "tournament event id" );
                           
		                      
		
		switch ( tournamentId ) {                                                               
			case 16: m_tokenItemDefName = 'tournament_pass_berlin2019_charge'; break;
		}
		
                                     
        var nCampaignID = parseInt( InventoryAPI.GetItemAttributeValue( journalId, "campaign id" ) );
                                                
        var numTotalChallenges = InventoryAPI.GetCampaignNodeCount( nCampaignID );
                                                            
        for ( var jj = 0; jj < numTotalChallenges; ++jj )
        {
            var nMissionNodeID = InventoryAPI.GetCampaignNodeIDbyIndex( nCampaignID, jj );
                                         
            var strNodeState = InventoryAPI.GetCampaignNodeState( nCampaignID, nMissionNodeID, journalId );
                                            
            var nQuestID = InventoryAPI.GetCampaignNodeQuestID( nCampaignID, nMissionNodeID );
            var strFauxQuestItem = InventoryAPI.GetQuestItemIDFromQuestID( nQuestID );
            var strQuestIcon = InventoryAPI.GetQuestIcon( strFauxQuestItem );
            var strQuestName = InventoryAPI.GetItemName( strFauxQuestItem );
                                                      
                                                                                                               
            m_test_challenges.push( {
                text: strQuestName,
                context: ( strQuestIcon === 'watchem' ) ? 'watch' : ( strQuestIcon === 'pickem' ) ?'trophy' : strQuestIcon,                                                   
                value: ( strNodeState === "complete" ) ? 1 : 0                                              
            } );
        }

        _SetBackgroundMovie( tournamentId );
        _SetTitle( journalId );
        _SetSubtitle( tournamentId );
        _SetModel( journalId );
        _SetBannerColor( journalId );
        _SetThesholdText( journalId, tournamentId );
        _UpdateChallengesList( journalId, tournamentId );
        _SouvenirsEarned( journalId, tournamentId );
        _SouvenirsImage( tournamentId );
        _SetEventSticker( tournamentId );
        _SetFaqBtn(tournamentId)
        _UpdateSetChargesBtn( ( m_activeTournament === tournamentId ) ? InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( g_ActiveTournamentInfo.itemid_charge, 0 ) : null );
        _UpdateApplyCharges();

        $.GetContextPanel().SetHasClass( 'tournament-over', m_activeTournament !== tournamentId );

        if ( m_activeTournament !== tournamentId )
        {
            _SetWinners( tournamentId );
            return;
        }

        _SetUpSpray();
        _WatchStreamBtn();
    };

    var _ClosePopup = function()
    {
        $.DispatchEvent( 'UIPopupButtonClicked', '' );
    };

    var _SetBackgroundMovie = function( id )
    {
        if ( id > 15 )
        {
            $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-container' ).style.backgroundImage = "url( 'file://{images}/tournaments/backgrounds/background_" + id + ".png' );";
        }
    };

    var _SetTitle = function( journalId )
    {
        $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-title' ).text = ItemInfo.GetName( journalId );
    };

    var _SetSubtitle = function( tournamentId )
    {
        $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-subtitle' ).text = tournamentId < 16 ? $.Localize( '#tournament_coin_desc' ) : $.Localize( '#tournament_coin_desc_token' )
    };
    
    var _SetModel = function( id )
    {
                                                                                   

        var elModel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-model' );
                                                                   
        var modelPath = ItemInfo.GetModelPathFromJSONOrAPI( id );
        
        var manifest = "resource/ui/econ/ItemModelPanelCharWeaponInspect.res";
        elModel.SetScene( manifest, modelPath, false );
        elModel.SetCameraPreset( 1, false );
        elModel.SetSceneIntroRotation( -10.0, 20, 1 );
    };

    var _SetBannerColor = function( journalId )
    {
        var coinLevel = InventoryAPI.GetItemAttributeValue( journalId, "upgrade level" );
                                                                                                 

        var style = coinLevel < 1 ? 'bronze' : coinLevel === 1 ? 'silver' : coinLevel > 1 ? 'gold' : 'bronze';
        $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-container' ).AddClass( style );
    };

    var _SetThesholdText = function( journalId, tournamentId )
    {
        var threshold = InventoryAPI.GetItemAttributeValue( journalId, "upgrade threshold" );
        var completedChallenges = m_test_challenges.filter( function( entry ) { return entry.value === 1; } );

        _SetPoints( completedChallenges );
        if ( !threshold || ( completedChallenges.length === m_test_challenges.length ) )
        {
            $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-remaining' ).visible = false;
            return;
        }

        var challengesRemain = threshold - completedChallenges.length;
    
        $.GetContextPanel().SetDialogVariableInt( 'challenges', challengesRemain );
        $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-remaining' ).text = tournamentId < 16 ?
            $.Localize( '#tournament_coin_remaining_challenges',  $.GetContextPanel() ) :
            $.Localize( '#tournament_coin_remaining_challenges_token',  $.GetContextPanel() );
    };

    var _SetPoints = function( completedChallenges )
    {
        $.GetContextPanel().SetDialogVariableInt( 'challenges_complete', completedChallenges.length );
    };

    var _SouvenirsEarned = function( journalId, tournamentId )
    {
		var coinLevel = InventoryAPI.GetItemAttributeValue( journalId, "upgrade level" );
		
		var coinRedeemsPurchased = InventoryAPI.GetItemAttributeValue( journalId, "operation drops awarded 1" );
		if ( coinRedeemsPurchased )                                                                          
			coinLevel += coinRedeemsPurchased;

        var redeemed = InventoryAPI.GetItemAttributeValue( journalId, "operation drops awarded 0" );
        var redeemsAvailable = coinLevel - redeemed;
        var redeemsEarned = ( coinLevel !== undefined ) ? coinLevel : 0;

        $.GetContextPanel().SetDialogVariableInt( 'redeems_earned', redeemsEarned );
        $.GetContextPanel().SetDialogVariableInt( 'redeems_remain', ( redeemsAvailable !== undefined ) ? redeemsAvailable : 0 );

                 
        var elLabel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-redeem-btn-label' );

        elLabel.text = redeemsAvailable === 1 ?
            $.Localize( '#tournament_coin_redeem_action', elLabel ) :
            $.Localize( '#tournament_coin_redeem_action_multi', elLabel );
        
        _RedeemBtn( redeemsAvailable );

                 
        elLabel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-souvenir-earned' );
        
        var locStringModifier = tournamentId < 16 ? 'souvenir_v2' : 'token';
        
        elLabel.text = redeemsEarned === 1?
            $.Localize( '#tournament_coin_earned_' + locStringModifier, elLabel ) :
            $.Localize( '#tournament_coin_earned_' + locStringModifier + '_multi', elLabel );
        
        $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-info-block-subtitle' ).text = tournamentId < 16 ?
            $.Localize( '#tournament_coin_redeem_souvenir' ) :
            $.Localize( '#tournament_coin_redeem_souvenir_' + tournamentId );
    };

    var _SouvenirsImage = function( tournamentId )
    {
        var elImage = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-ticket-icon' );
        if ( tournamentId < 16 )
        {
            elImage.SetImage( 'file://{images}/tournaments/souvenir/souvenir_blank_tournament_' + tournamentId + '.png' );
        }
        else
        {
            elImage.itemid = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( g_ActiveTournamentInfo.itemid_charge, 0 );
        }
    };

    var _RedeemBtn = function( redeemsAvailable )
    {   
        var elbtn = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-redeem-btn' );
        elbtn.enabled = !m_isInMatch && redeemsAvailable > 0;
    };

    var _AnimRedeemValue = function()
    {
        var elbtn = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-souvenir-earned-value' );
        elbtn.AddClass( 'tournament-journal__info-block__title--update-anim' );

        $.Schedule( 1, function(){
            elbtn.RemoveClass( 'tournament-journal__info-block__title--update-anim' );
        });
    };

    var _SetEventSticker = function( tournamentId )
    {
        var elTitleBar = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-title-bar' );
        
        $.CreatePanel(
            "Image",
            elTitleBar,
            '',
            {
                texturewidth: '98',
                textureheight: '-1',
                src: 'file://{images}/tournaments/events/tournament_logo_' + tournamentId + '.svg',
                class: 'tournament-journal__titlebar__logo'
        });
    };

    var _UpdateChallengesList = function( journalId, tournamentId )
    {
        var elList = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal__challenges-list' );
        var firstWatchContext = false;
        
        m_test_challenges.forEach( function( obj, index )
        {
            var elChallenge = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal__challenges' + index );
            
            if ( !elChallenge )
            {
                elChallenge = _CreateChallenge( obj, elList, index );
            }
            _UpdateChallenge( obj, elChallenge, index, tournamentId );
        } );

        function _CreateChallenge ( objData, elList, index )
        {
            var elChallenge = $.CreatePanel( "Panel", elList, 'id-tournament-journal__challenges' + index );
            elChallenge.BLoadLayoutSnippet( "tournament-challenge" );
            elChallenge.SetHasClass( 'dark', ( index % 2 !== 0 ) );

            if ( tournamentId < 16 )
            {
                elChallenge.SetHasClass( 'margin-top', ( index % 2 !== 0 ) );
            }
            else 
            {
                if ( index === 1 )
                {
                    elChallenge.SetHasClass( 'margin-top', true );
                }

                if ( objData.context === 'trophy' && !firstWatchContext )
                {
                    firstWatchContext = true;
                    elChallenge.SetHasClass( 'margin-top', true );
                }
            }

            $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-container' ).AddBlurPanel( elChallenge );
            
            return elChallenge;
        }

        function _UpdateChallenge ( objData, elChallenge, index, tournamentId )
        {
            var elName = elChallenge.FindChildInLayoutFile( 'id-tournament-journal__challenge__name' );
            var elIcon = elChallenge.FindChildInLayoutFile( 'id-tournament-journal__challenge__icon' );
            elName.text = objData.text;

            var iconPath = objData.value === 1 ? 'file://{images}/icons/ui/check.svg' :
                'file://{images}/icons/ui/' + objData.context + '.svg';

            elIcon.SetImage( iconPath );
            elChallenge.SetHasClass( 'complete', objData.value === 1 );

                                                                                                          
            var bForceEnablePlayContext = false;                                                                        

            elChallenge.enabled = objData.value !== 1 && !m_isInMatch && ( m_activeTournament === tournamentId || bForceEnablePlayContext );

            if ( objData.context === "trophy" )
            {
                _OnActivatePickemChallenge( elChallenge, index );
            }
            else if ( objData.context === 'watch' )
            {
                _OnWatchStream( elChallenge );
			}
			else if ( objData.context === 'play' )
            {
                _OnActivatePlayChallenge( elChallenge, index );
            }
        }

        function _OnActivatePickemChallenge ( elPanel, index )
        {
            var idforTab = '';
            switch ( index )
            {
                case 8: 
                    idforTab = 'id-nav-pick-prelims';
                    break;
                case 10: 
                    idforTab = 'id-nav-pick-group';
                    break;
                default: 
                    idforTab = 'id-nav-pick-playoffs';
                    break;
              }
            
            elPanel.SetPanelEvent( 'onactivate', OnActivate.bind( undefined, idforTab ) );
            
            function OnActivate ( idforTab )
            {
                $.DispatchEvent( 'OpenWatchMenu' );
                $.DispatchEvent( 'ShowActiveTournamentPage', idforTab );
                _ClosePopup();
            }
		}
		
		function _OnActivatePlayChallenge( elPanel, index )
        {
			var maps = [
				'de_inferno',
				'de_mirage', 
				'de_dust2',
				'de_overpass',
				'de_train',
				'de_nuke',
				'de_vertigo'
			];
			var pickedMap = ( index > 0 && index <= maps.length ) ? maps[ index - 1 ] : '';
			if ( !pickedMap ) return;

            elPanel.SetPanelEvent( 'onactivate', OnActivate.bind( undefined, 'mg_'+pickedMap ) );
            
            function OnActivate ( mapGroup )
            {
				                                                          
				if ( LobbyAPI.IsSessionActive() && !LobbyAPI.BIsHost() )
				{	                                                                                                                                       
					LobbyAPI.CloseSession();
				}

				                                            
				if ( LobbyAPI.IsSessionActive() )
				{
					var settingsGame = LobbyAPI.GetSessionSettings().game;
					if ( settingsGame && settingsGame.mmqueue )
					{
						LobbyAPI.StopMatchmaking();
					}

					settingsGame = LobbyAPI.GetSessionSettings().game;
					if ( settingsGame && settingsGame.mmqueue )
					{	                                          
						return;
					}
				}

				if ( !LobbyAPI.IsSessionActive() )
				{
					LobbyAPI.CreateSession();
				}

				var gameType = 'classic';
				var gameMode = 'competitive';

				if ( !LobbyAPI.IsSessionActive() )
					return;

				  
				                            
				  
				                                                                                              
				var settings = {
					update: {
						Options: {
							action: "custommatch",
							server: "official"
						},
						Game: {
							mode: gameMode,
							type: gameType,
							mapgroupname: mapGroup,
							questid: 0
						},
					}
				};

				LobbyAPI.UpdateSessionSettings( settings );

				var bStartMatchmaking = true;
				if ( bStartMatchmaking )
				{
					LobbyAPI.StartMatchmaking( '', '', '', '' );
				}

				$.DispatchEvent( 'UIPopupButtonClicked', '' );
				$.DispatchEvent( 'OpenPlayMenu', '' );
                
                _ClosePopup();
            }
        }
    };

    var _OnWatchStream = function( elPanel )
    {
        elPanel.SetPanelEvent( 'onactivate', function()
        {
            SteamOverlayAPI.OpenURL( 'https://steam.tv/csgo' );
        } );
    };

    var _SetUpSpray = function()
    {
        var journalId = $.GetContextPanel().GetAttributeString( "journalid", '' );
        var elImage = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-spray' );
        elImage.itemid = ItemInfo.GetFauxReplacementItemID( journalId, 'graffiti' );

                                                
        
        var elIBtn = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-selectspray-btn' );
        elIBtn.SetPanelEvent( 'onactivate', function(){
                UiToolkitAPI.ShowCustomLayoutPopupParameters(
                    '',
                    'file://{resources}/layout/popups/popup_tournament_select_spray.xml',
                    'journalid=' + journalId
                );
            }
        );
    };

    var _OnActivateRedeem = function()
    {
        $.DispatchEvent( 'OpenWatchMenu' );
        $.DispatchEvent( 'ShowActiveTournamentPage', 'id-nav-matches' );
        _ClosePopup();
    };

    var _WatchStreamBtn = function()
    {   
        var elPanel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-watch-stream' );
        _OnWatchStream( elPanel );
    };

    var _SetWinners = function( tournamentId )
    {
                                                                      
        var aData = [
            { tournamentId: 15, team: 'astr', teamname: '#CSGO_TeamID_60', descString: '#CSGO_CollectibleCoin_Katowice2019_Champion' },
            { tournamentId: 16, team: 'astr', teamname: '#CSGO_TeamID_60', descString: '#CSGO_CollectibleCoin_berlin2019_Champion' }
                                      
        ];

        var ObjWinner = aData.filter( winner => winner.tournamentId == tournamentId )[0];

        $.GetContextPanel().FindChildInLayoutFile( 'tournament-journal-winners-img' ).SetImage( "file://{images}/tournaments/teams/" + ObjWinner.team +".svg"); 
        $.GetContextPanel().FindChildInLayoutFile( 'tournament-journal-winners-desc' ).text = $.Localize( ObjWinner.descString );
        $.GetContextPanel().FindChildInLayoutFile( 'tournament-journal-winners-title' ).text = $.Localize( ObjWinner.teamname );

        var elModel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-trophy' );
        elModel.SetCameraPreset( 1, false );
        elModel.SetSceneIntroRotation( -8.0, 60, 1 );
        elModel.SetFlashlightColor( 2, 2, 2 );
    };

    var _UpdateSetChargesBtn = function( id )
    {
        var btn = $.GetContextPanel().FindChildInLayoutFile( 'id-get-charges-btn' );
        btn.visible = false;
        
        if ( id && id !== '0' && id !== '-1' && ItemInfo.GetStoreSalePrice( id, 1, '' ) )
        {
            btn.visible = true;
            btn.SetPanelEvent( 'onactivate', function()
            {
                UiToolkitAPI.ShowCustomLayoutPopupParameters(
                '',
                'file://{resources}/layout/popups/popup_inventory_inspect.xml',
                'itemid=' + id + '&' +
                'inspectonly=false' +
                '&' + 'extrapopupfullscreenstyle=solidbkgnd' +
                '&' + 'asyncworkitemwarning=no' +
                '&' + 'storeitemid=' + id,
                'none'
		        );
            } );
        }
    };

    var _UpdateApplyCharges = function()
    {
        var btn = $.GetContextPanel().FindChildInLayoutFile( 'id-activate-charges-btn' );  
        $.GetContextPanel().FindChildInLayoutFile( 'id-activate-spinner' ).visible = false;
		btn.visible = false;
		
		if ( !m_tokenItemDefName )
			return;

        InventoryAPI.SetInventorySortAndFilters( 'inv_sort_age', false, 'item_definition:' + m_tokenItemDefName, '', '' );
                                                            
        var count = InventoryAPI.GetInventoryCount();
        var aItemIds = [];
                                 

        for ( var i = 0; i < count; i++ )
        {
            aItemIds.push( InventoryAPI.GetInventoryItemIDByIndex( i ));
        }

        if ( aItemIds.length > 0 )
        {
            btn.SetDialogVariableInt( 'tokens', aItemIds.length );
            btn.SetPanelEvent( 'onactivate', function()
            {
                if ( m_scheduleHandle )
                {
                    $.CancelScheduled( m_scheduleHandle );
                    m_scheduleHandle = null;
                }

                aItemIds.forEach( item => InventoryAPI.UseTool( item, '' ) );

                $.GetContextPanel().FindChildInLayoutFile( 'id-activate-spinner' ).visible = true;
                btn.visible = false;
                m_scheduleHandle = $.Schedule( 5, _CancelWaitforCallBack );
            } );

            
            btn.text = aItemIds.length === 1 ?
                $.Localize( '#tournament_activate_tokens', btn ) :
                $.Localize( '#tournament_activate_tokens_multi', btn );
            
            btn.visible = true;
        }

    };

    var _CancelWaitforCallBack = function()
	{
		m_scheduleHandle = null;
		
        $.GetContextPanel().FindChildInLayoutFile( 'id-activate-spinner' ).visible = false;

        _ClosePopup();

		UiToolkitAPI.ShowGenericPopupOk(
			$.Localize( '#SFUI_SteamConnectionErrorTitle' ),
			$.Localize( '#SFUI_InvError_Item_Not_Given' ),
			'',
			function()
			{
			},
			function()
			{
			}
		);
    };
    
    var _ResetTimeouthandle = function()
	{
		if ( m_scheduleHandle )
		{
			$.CancelScheduled( m_scheduleHandle );
			m_scheduleHandle = null;
		}
    };
    
    var _OnItemCustomization =  function( numericType, type, itemid )
    {
        if ( type === 'ticket_activated' )
        {
            _ResetTimeouthandle();
            _UpdateApplyCharges();

            var journalId = itemid;
            var tournamentId = InventoryAPI.GetItemAttributeValue( journalId, "tournament event id" );

            _AnimRedeemValue();
            $.Schedule( .25, _SouvenirsEarned.bind( undefined, journalId, tournamentId ));
       }
    };

    var _OnInventoryUpdated = function()
    {
        _ResetTimeouthandle();
        _SetUpSpray();
        _UpdateApplyCharges();
    };

    var _SetFaqBtn = function( tournamentId )
    {
        $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-faq' ).SetPanelEvent( 'onactivate', function(){
            switch( tournamentId ) {
                case 15:
                    SteamOverlayAPI.OpenURL( 'http://www.counter-strike.net/pickem/katowice2019#faq' );
                  break;
                case 16:
                    SteamOverlayAPI.OpenURL( 'http://www.counter-strike.net/pickem/berlin2019#faq' );
                  break;
                default:
                    SteamOverlayAPI.OpenURL( 'http://www.counter-strike.net/pickem/katowice2019#faq' );
              } 
        });
    };

	return{
		Init: _Init,
        ClosePopup: _ClosePopup,
        SetUpSpray: _SetUpSpray,
        OnInventoryUpdated: _OnInventoryUpdated,
        OnItemCustomization: _OnItemCustomization,
        OnActivateRedeem: _OnActivateRedeem
	};
} )();

( function()
{
    $.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', TournamentJournal.OnInventoryUpdated );
    $.RegisterForUnhandledEvent( 'PanoramaComponent_Inventory_ItemCustomizationNotification', TournamentJournal.OnItemCustomization );
} )();