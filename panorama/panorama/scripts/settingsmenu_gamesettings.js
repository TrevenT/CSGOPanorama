'use strict';

var SettingsMenuGameSettings = ( function() {

    var _InitSteamClanTagsPanel = function () {   
        var clanTagDropdown = $('#ClanTagsEnum');
        clanTagDropdown.RemoveAllOptions();

                                       
        var id = 'clantagoption_none';
        var optionLabel = $.CreatePanel('Label', clanTagDropdown, id);
        optionLabel.text = $.Localize("#SFUI_Settings_ClanTag_None");
        optionLabel.SetAttributeString('value', 0 );
        clanTagDropdown.AddOption(optionLabel);

        var nNumClans = MyPersonaAPI.GetMyClanCount();
        for (var i = 0; i < nNumClans; i++)
        {
                                                               
            var clanID = MyPersonaAPI.GetMyClanIdByIndex(i);
            var clanTag = MyPersonaAPI.GetMyClanTagByIdCensored(clanID);

                                                                      
            var clanIDForCvar = MyPersonaAPI.GetMyClanId32BitByIndex(i);

            id = 'clantagoption' + i.toString();
            optionLabel = $.CreatePanel('Label', clanTagDropdown, id, { text: clanTag });
            optionLabel.SetAttributeString('value', clanIDForCvar.toString() );
            clanTagDropdown.AddOption(optionLabel);
        }

        clanTagDropdown.RefreshDisplay();
    };

    return {

        InitSteamClanTagsPanel : _InitSteamClanTagsPanel
    };

})();

              
(function ()
{
    SettingsMenuGameSettings.InitSteamClanTagsPanel();
})();