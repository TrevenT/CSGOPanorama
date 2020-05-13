'use strict';

var TournamentJournal = ( function()
{
    var m_test_challenges = [
                                                                                                                                    
    ];

                                                                                         
                                                                                                                            
                                                         
                                                                                                                                   
    var m_activeTournament = 16;

    var m_isInMatch = GameStateAPI.IsDemoOrHltv() || GameStateAPI.IsLocalPlayerPlayingMatch(); 

    var _Init = function()
    {
        var journalId = $.GetContextPanel().GetAttributeString( "journalid", '' );
        var tournamentId = InventoryAPI.GetItemAttributeValue( journalId, "tournament event id" );
                           
                              
		
                                     
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

        _SetTitle( journalId );
        _SetModel( journalId );
        _SetBannerColor( journalId );
        _SetThesholdText( journalId );
        _UpdateChallengesList( journalId, tournamentId );
        _SouvenirsEarned( journalId );
        _SouvenirsImage( tournamentId );
        _SetEventSticker( tournamentId );

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

    var _SetTitle = function( journalId )
    {
        $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-title' ).text = ItemInfo.GetName( journalId );
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

    var _SetThesholdText = function( journalId )
    {
        var threshold = InventoryAPI.GetItemAttributeValue( journalId, "upgrade threshold" );
        var completedChallenges = m_test_challenges.filter( function( entry ) { return entry.value === 1; } );

        _SetPoints( completedChallenges );
        if ( completedChallenges.length === m_test_challenges.length )
        {
            $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-remaining' ).visible = false;
            return;
        }

        var challengesRemain = threshold - completedChallenges.length;
        $.GetContextPanel().SetDialogVariableInt( 'challenges', challengesRemain );
    };

    var _SetPoints = function( completedChallenges )
    {
        $.GetContextPanel().SetDialogVariableInt( 'challenges_complete', completedChallenges.length );
    };

    var _SouvenirsEarned = function( journalId )
    {
        var coinLevel = InventoryAPI.GetItemAttributeValue( journalId, "upgrade level" );
        var redeemed = InventoryAPI.GetItemAttributeValue( journalId, "operation drops awarded 0" );
        var redeemsAvailable = coinLevel - redeemed;

        $.GetContextPanel().SetDialogVariableInt( 'redeems_earned', ( coinLevel !== undefined ) ? coinLevel : 0 );
        $.GetContextPanel().SetDialogVariableInt( 'redeems_remain', ( redeemsAvailable !== undefined ) ? redeemsAvailable : 0 );

                 
        var elLabel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-redeem-btn-label' );

        elLabel.text = redeemsAvailable === 1 ?
            $.Localize( '#tournament_coin_redeem_action', elLabel ) :
            $.Localize( '#tournament_coin_redeem_action_multi', elLabel );
        
        _RedeemBtn( redeemsAvailable );

                 
        elLabel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-souvenir-earned' );
        
        elLabel.text = redeemsAvailable === 1 ?
            $.Localize( '#tournament_coin_earned_souvenir', elLabel ) :
            $.Localize( '#tournament_coin_earned_souvenir_multi', elLabel );
    };

    var _SouvenirsImage = function( tournamentId )
    {
        var elImage = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-ticket-icon' );
        elImage.SetImage( 'file://{images}/tournaments/souvenir/souvenir_blank_tournament_' + tournamentId + '.png' );
    };

    var _RedeemBtn = function( redeemsAvailable )
    {   
        var elbtn = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-redeem-btn' );
        elbtn.enabled = !m_isInMatch && redeemsAvailable > 0;
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

        m_test_challenges.forEach( function( obj, index )
        {
            var elChallenge = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal__challenges' + index );
            
            if ( !elChallenge )
            {
                elChallenge = _CreateChallenge( elList, index );
            }
            _UpdateChallenge( obj, elChallenge, index, tournamentId );
        } );

        function _CreateChallenge ( elList, index )
        {
            var elChallenge = $.CreatePanel( "Panel", elList, 'id-tournament-journal__challenges' + index );
            elChallenge.BLoadLayoutSnippet( "tournament-challenge" );

            elChallenge.SetHasClass( 'dark', ( index % 2 !== 0 ) );
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
            elChallenge.enabled = objData.value !== 1 && !m_isInMatch && m_activeTournament === tournamentId;

            if ( objData.context === "trophy" )
            {
                _OnActivatePickemChallenge( elChallenge, index );
            }
            else if ( objData.context === 'watch' )
            {
                _OnWatchStream( elChallenge );
            }
        }

        function _OnActivatePickemChallenge ( elPanel, index )
        {
            var idforTab = '';
            switch ( index )
            {
                case 1: 
                    idforTab = 'id-nav-pick-prelims';
                    break;
                case 3: 
                    idforTab = 'id-nav-pick-group';
                    break;
                case 5: 
                    idforTab = 'id-nav-pick-playoffs';
                    break;
                case 7: 
                    idforTab = 'id-nav-pick-playoffs';
                    break;
                case 9: 
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
            { tournamentId: 15, team: 'astr', teamname: '#CSGO_TeamID_60', descString: '#CSGO_CollectibleCoin_Katowice2019_Champion' }
                                      
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

	return{
		Init: _Init,
        ClosePopup: _ClosePopup,
        SetUpSpray: _SetUpSpray,
        OnActivateRedeem: _OnActivateRedeem
	};
} )();

( function()
{
    $.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', TournamentJournal.SetUpSpray );
} )();

