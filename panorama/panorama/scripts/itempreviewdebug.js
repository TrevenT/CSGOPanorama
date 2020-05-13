"use strict";

function OnReload()
{
                                       
}

function TestJS()
{
                       
    var parent = $.GetContextPanel().GetParent();

                             

                            
                           

                        
                       

                                                                 
                                                                           

                                                      
                                                                                                                
                                                                                           
                                                 

                                                                                
                                               
                                                                                                         
                                             
                                                                            

                                         
                                                  

                                                                          
                                                                    

                                       
                                                                  

                                                                                                            
                                                 

                                                
                                                                  
                                   
                                   
                                                                                    
                                                           
                                                                      
                 
                                                                                                                                                     
                                                                                                                                               
                                                                                                                                                                
                                                                                                                                        
                                                                                                                      
                                                                                
                                                                                                                     

                                                                       
                                                                                                       
                                    
                                                                         

                                                                                                                          
                                                                                        
                                                                    

                                                      
                                                                                                                           

                                                                                    
                                                                               

                                                                                                 
                                                     
                                     

                                                 
                                                                                                                        
                                                                                 
                                                                                                                                
                                                                         

                                                                               
                                                                               
                                   
                                                                                                       
                                                                                                                                                                                                                         
                                                                                           

                                                                                  
                                                                                    
                                                         

                                           
                                                   
                                                                                                                
                                                                                                  
                                                                                            

              
    parent.ResetAnimation( false );

                                         
                                                     
                                          
                                                             
                                                                         
    parent.EquipPlayerFromLoadout( 'ct', 'rifle3' );

    parent.QueueSequence( 'loadout_rifl_spawn_02', true );
    parent.QueueSequence( 'loadout_rifl_idle_long', false );
}

function TestJSTwitch()
{
                             
    var parent = $.GetContextPanel().GetParent();

    parent.ResetAnimation( false );
    parent.QueueSequence( 'default', true );
    parent.LayerSequence( 'loadout_rifl_spawn_01', false, false );
    parent.LayerSequence( 'loadout_rifl_idle_looking', true, true );
}

function ParticleTest()
{
                             
    var parent = $.GetContextPanel().GetParent();
    
    parent.SetParticleSystemOffsetPosition( 0.0, 0.0, 0.0 );

    parent.AddParticleSystem( 'weapon_confetti_omni', 'weapon_hand_R', true );

                                                                 
                                                                

                                                                       
                                                                         

                                                           
 }
 